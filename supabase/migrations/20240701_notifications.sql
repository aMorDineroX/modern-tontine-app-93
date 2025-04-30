-- Migration pour ajouter les tables de notifications à Supabase

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_notification_type CHECK (type IN ('info', 'success', 'warning', 'error'))
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les notifications
-- Les utilisateurs ne peuvent voir que leurs propres notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres notifications (marquer comme lues)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(20) DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer toutes les notifications d'un utilisateur comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour supprimer les notifications anciennes (plus de 30 jours)
CREATE OR REPLACE FUNCTION delete_old_notifications() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days' AND read = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_old_notifications
AFTER INSERT ON notifications
EXECUTE FUNCTION delete_old_notifications();

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE notifications IS 'Stocke les notifications des utilisateurs';
COMMENT ON COLUMN notifications.id IS 'Identifiant unique de la notification';
COMMENT ON COLUMN notifications.user_id IS 'Identifiant de l''utilisateur destinataire';
COMMENT ON COLUMN notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN notifications.message IS 'Contenu de la notification';
COMMENT ON COLUMN notifications.type IS 'Type de notification: info, success, warning, error';
COMMENT ON COLUMN notifications.read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN notifications.action_url IS 'URL optionnelle pour une action liée à la notification';
COMMENT ON COLUMN notifications.created_at IS 'Date et heure de création de la notification';
