-- Migration pour ajouter la table des rôles utilisateurs à Supabase

-- Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'admin', 'moderator', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Création des politiques de sécurité RLS (Row Level Security)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_roles (lecture admin, écriture admin)
CREATE POLICY "User roles are viewable by admins only" 
ON user_roles FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "User roles are insertable by admins only" 
ON user_roles FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "User roles are updatable by admins only" 
ON user_roles FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "User roles are deletable by admins only" 
ON user_roles FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION has_role(p_user_id UUID, p_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$ LANGUAGE plpgsql;
