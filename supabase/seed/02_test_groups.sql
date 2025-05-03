-- Insertion de groupes de tontine de test dans la base de données Supabase

-- Fonction pour insérer un groupe de tontine de test
CREATE OR REPLACE FUNCTION insert_test_group(
  p_name TEXT,
  p_contribution_amount DECIMAL,
  p_frequency frequency,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_payout_method payout_method,
  p_created_by UUID
) RETURNS INTEGER AS $$
DECLARE
  v_group_id INTEGER;
BEGIN
  -- Insérer le groupe
  INSERT INTO tontine_groups (
    name,
    contribution_amount,
    frequency,
    start_date,
    payout_method,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    p_name,
    p_contribution_amount,
    p_frequency,
    p_start_date,
    p_payout_method,
    p_created_by,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_group_id;
  
  -- Ajouter le créateur comme membre admin du groupe
  INSERT INTO group_members (
    group_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    v_group_id,
    p_created_by,
    'admin',
    'active',
    NOW(),
    NOW(),
    NOW()
  );
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter un membre à un groupe
CREATE OR REPLACE FUNCTION add_test_group_member(
  p_group_id INTEGER,
  p_user_id UUID,
  p_role user_role DEFAULT 'member',
  p_status member_status DEFAULT 'active'
) RETURNS VOID AS $$
BEGIN
  -- Ajouter le membre au groupe
  INSERT INTO group_members (
    group_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    p_user_id,
    p_role,
    p_status,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (group_id, user_id) DO UPDATE
  SET role = p_role,
      status = p_status,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Créer des groupes de tontine de test
DO $$
DECLARE
  v_group1_id INTEGER;
  v_group2_id INTEGER;
  v_group3_id INTEGER;
  
  -- IDs des utilisateurs de test
  v_admin_id UUID := '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID;
  v_alice_id UUID := 'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID;
  v_bob_id UUID := '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID;
  v_claire_id UUID := '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID;
  v_david_id UUID := 'f2d7e994-de3d-4d56-8d0b-31d9c33a297e'::UUID;
BEGIN
  -- Groupe 1: Groupe familial (créé par Alice)
  v_group1_id := insert_test_group(
    'Groupe Familial',
    100.00,
    'monthly',
    NOW() + INTERVAL '1 day',
    'rotation',
    v_alice_id
  );
  
  -- Ajouter des membres au groupe 1
  PERFORM add_test_group_member(v_group1_id, v_bob_id);
  PERFORM add_test_group_member(v_group1_id, v_claire_id);
  PERFORM add_test_group_member(v_group1_id, v_david_id, 'member', 'pending');
  
  -- Groupe 2: Groupe d'amis (créé par Bob)
  v_group2_id := insert_test_group(
    'Groupe d''Amis',
    50.00,
    'biweekly',
    NOW() + INTERVAL '3 days',
    'random',
    v_bob_id
  );
  
  -- Ajouter des membres au groupe 2
  PERFORM add_test_group_member(v_group2_id, v_alice_id);
  PERFORM add_test_group_member(v_group2_id, v_claire_id);
  
  -- Groupe 3: Groupe de collègues (créé par Claire)
  v_group3_id := insert_test_group(
    'Groupe de Collègues',
    200.00,
    'weekly',
    NOW() + INTERVAL '7 days',
    'bidding',
    v_claire_id
  );
  
  -- Ajouter des membres au groupe 3
  PERFORM add_test_group_member(v_group3_id, v_alice_id);
  PERFORM add_test_group_member(v_group3_id, v_bob_id);
  PERFORM add_test_group_member(v_group3_id, v_david_id);
  PERFORM add_test_group_member(v_group3_id, v_admin_id, 'member', 'pending');
  
  RAISE NOTICE 'Groupes de tontine de test insérés avec succès';
END $$;
