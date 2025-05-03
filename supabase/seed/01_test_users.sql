-- Insertion d'utilisateurs de test dans la base de données Supabase
-- Note: Les utilisateurs doivent d'abord être créés via l'API d'authentification Supabase
-- Ce script insère uniquement les profils associés aux utilisateurs

-- Fonction pour insérer un utilisateur de test si l'UUID n'existe pas déjà
CREATE OR REPLACE FUNCTION insert_test_user(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Insérer l'utilisateur dans la table auth.users (simulation)
  -- Dans un environnement réel, les utilisateurs seraient créés via l'API d'authentification
  RAISE NOTICE 'Utilisateur % (%) serait créé via l''API d''authentification', p_full_name, p_email;
  
  -- Insérer le profil associé
  INSERT INTO profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (p_id, p_full_name, p_avatar_url, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE 
  SET full_name = p_full_name,
      avatar_url = p_avatar_url,
      updated_at = NOW();
      
  -- Insérer un rôle par défaut pour l'utilisateur
  INSERT INTO user_roles (user_id, role, created_at, updated_at)
  VALUES (p_id, 'user', NOW(), NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Initialiser les points de fidélité pour l'utilisateur
  INSERT INTO user_points (user_id, points, total_earned, last_activity, created_at, updated_at)
  VALUES (p_id, 0, 0, NOW(), NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Utilisateurs de test (avec des UUID fixes pour la cohérence)
SELECT insert_test_user(
  '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID,
  'admin@example.com',
  'Admin Utilisateur',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
);

SELECT insert_test_user(
  'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID,
  'alice@example.com',
  'Alice Dupont',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
);

SELECT insert_test_user(
  '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID,
  'bob@example.com',
  'Bob Martin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
);

SELECT insert_test_user(
  '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID,
  'claire@example.com',
  'Claire Dubois',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=claire'
);

SELECT insert_test_user(
  'f2d7e994-de3d-4d56-8d0b-31d9c33a297e'::UUID,
  'david@example.com',
  'David Lefebvre',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
);

-- Attribuer le rôle d'administrateur à l'utilisateur admin
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES (
  '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Utilisateurs de test insérés avec succès';
END $$;
