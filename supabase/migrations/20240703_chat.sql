-- Migration pour ajouter les tables du système de chat amélioré à Supabase

-- Table des messages directs entre utilisateurs
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);

-- Table des groupes de chat
CREATE TABLE IF NOT EXISTS chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres des groupes de chat
CREATE TABLE IF NOT EXISTS chat_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id),
  CONSTRAINT valid_member_role CHECK (role IN ('admin', 'member'))
);

-- Table des messages de groupe
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);

-- Table des statuts de lecture des messages de groupe
CREATE TABLE IF NOT EXISTS group_message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_group_id ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_user_id ON chat_group_members(user_id);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_message_reads ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les messages directs
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of their received messages" 
ON messages FOR UPDATE 
USING (auth.uid() = receiver_id)
WITH CHECK (
  auth.uid() = receiver_id AND
  OLD.read = FALSE AND
  NEW.read = TRUE AND
  OLD.sender_id = NEW.sender_id AND
  OLD.receiver_id = NEW.receiver_id AND
  OLD.content = NEW.content AND
  OLD.attachment_url IS NOT DISTINCT FROM NEW.attachment_url AND
  OLD.created_at = NEW.created_at
);

-- Politiques RLS pour les groupes de chat
CREATE POLICY "Users can view groups they are members of" 
ON chat_groups FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = chat_groups.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chat groups" 
ON chat_groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update group details" 
ON chat_groups FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = chat_groups.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Politiques RLS pour les membres des groupes
CREATE POLICY "Users can view members of groups they belong to" 
ON chat_group_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = chat_group_members.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can add members" 
ON chat_group_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = chat_group_members.group_id AND user_id = auth.uid() AND role = 'admin'
  ) OR (
    -- Permettre à l'utilisateur de s'ajouter lui-même aux groupes publics
    auth.uid() = chat_group_members.user_id AND
    NOT EXISTS (
      SELECT 1 FROM chat_groups 
      WHERE id = chat_group_members.group_id AND is_private = TRUE
    )
  )
);

-- Politiques RLS pour les messages de groupe
CREATE POLICY "Group members can view group messages" 
ON group_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages" 
ON group_messages FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM chat_group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
);

-- Politiques RLS pour les statuts de lecture
CREATE POLICY "Users can view read statuses of messages in their groups" 
ON group_message_reads FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_messages
    JOIN chat_group_members ON group_messages.group_id = chat_group_members.group_id
    WHERE group_messages.id = group_message_reads.message_id
    AND chat_group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read" 
ON group_message_reads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fonction pour marquer un message comme lu
CREATE OR REPLACE FUNCTION mark_message_as_read(
  p_message_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE id = p_message_id AND receiver_id = auth.uid() AND read = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer tous les messages d'un expéditeur comme lus
CREATE OR REPLACE FUNCTION mark_all_messages_as_read(
  p_sender_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE sender_id = p_sender_id AND receiver_id = auth.uid() AND read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer un message de groupe comme lu
CREATE OR REPLACE FUNCTION mark_group_message_as_read(
  p_message_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier si l'entrée existe déjà
  IF EXISTS (
    SELECT 1 FROM group_message_reads
    WHERE message_id = p_message_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Insérer une nouvelle entrée
  INSERT INTO group_message_reads (message_id, user_id, read_at)
  VALUES (p_message_id, auth.uid(), NOW());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer tous les messages d'un groupe comme lus
CREATE OR REPLACE FUNCTION mark_all_group_messages_as_read(
  p_group_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_message_id UUID;
BEGIN
  -- Parcourir tous les messages non lus du groupe
  FOR v_message_id IN
    SELECT gm.id
    FROM group_messages gm
    WHERE gm.group_id = p_group_id
    AND NOT EXISTS (
      SELECT 1 FROM group_message_reads gmr
      WHERE gmr.message_id = gm.id AND gmr.user_id = auth.uid()
    )
  LOOP
    -- Marquer chaque message comme lu
    INSERT INTO group_message_reads (message_id, user_id, read_at)
    VALUES (v_message_id, auth.uid(), NOW());
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE messages IS 'Messages directs entre utilisateurs';
COMMENT ON TABLE chat_groups IS 'Groupes de discussion';
COMMENT ON TABLE chat_group_members IS 'Membres des groupes de discussion';
COMMENT ON TABLE group_messages IS 'Messages dans les groupes de discussion';
COMMENT ON TABLE group_message_reads IS 'Statuts de lecture des messages de groupe';
