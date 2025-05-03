-- Insertion de contributions et paiements de test dans la base de données Supabase

-- Fonction pour insérer une contribution de test
CREATE OR REPLACE FUNCTION insert_test_contribution(
  p_group_id INTEGER,
  p_user_id UUID,
  p_amount DECIMAL,
  p_status contribution_status,
  p_payment_date TIMESTAMP WITH TIME ZONE
) RETURNS INTEGER AS $$
DECLARE
  v_contribution_id INTEGER;
BEGIN
  -- Insérer la contribution
  INSERT INTO contributions (
    group_id,
    user_id,
    amount,
    status,
    payment_date,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    p_user_id,
    p_amount,
    p_status,
    p_payment_date,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_contribution_id;
  
  RETURN v_contribution_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour insérer un paiement de test
CREATE OR REPLACE FUNCTION insert_test_payout(
  p_group_id INTEGER,
  p_user_id UUID,
  p_amount DECIMAL,
  p_status payout_status,
  p_payout_date TIMESTAMP WITH TIME ZONE
) RETURNS INTEGER AS $$
DECLARE
  v_payout_id INTEGER;
BEGIN
  -- Insérer le paiement
  INSERT INTO payouts (
    group_id,
    user_id,
    amount,
    status,
    payout_date,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    p_user_id,
    p_amount,
    p_status,
    p_payout_date,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_payout_id;
  
  RETURN v_payout_id;
END;
$$ LANGUAGE plpgsql;

-- Insérer des contributions et paiements de test
DO $$
DECLARE
  -- IDs des utilisateurs de test
  v_admin_id UUID := '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID;
  v_alice_id UUID := 'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID;
  v_bob_id UUID := '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID;
  v_claire_id UUID := '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID;
  v_david_id UUID := 'f2d7e994-de3d-4d56-8d0b-31d9c33a297e'::UUID;
  
  -- Variables pour stocker les IDs des groupes
  v_group1_id INTEGER;
  v_group2_id INTEGER;
  v_group3_id INTEGER;
  
  -- Dates pour les contributions et paiements
  v_past_date1 TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '30 days';
  v_past_date2 TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '15 days';
  v_current_date TIMESTAMP WITH TIME ZONE := NOW();
  v_future_date1 TIMESTAMP WITH TIME ZONE := NOW() + INTERVAL '15 days';
  v_future_date2 TIMESTAMP WITH TIME ZONE := NOW() + INTERVAL '30 days';
BEGIN
  -- Récupérer les IDs des groupes
  SELECT id INTO v_group1_id FROM tontine_groups WHERE name = 'Groupe Familial' LIMIT 1;
  SELECT id INTO v_group2_id FROM tontine_groups WHERE name = 'Groupe d''Amis' LIMIT 1;
  SELECT id INTO v_group3_id FROM tontine_groups WHERE name = 'Groupe de Collègues' LIMIT 1;
  
  -- Vérifier que les groupes existent
  IF v_group1_id IS NULL OR v_group2_id IS NULL OR v_group3_id IS NULL THEN
    RAISE EXCEPTION 'Un ou plusieurs groupes n''existent pas. Exécutez d''abord le script 02_test_groups.sql.';
  END IF;
  
  -- Contributions pour le Groupe 1 (Groupe Familial)
  -- Contributions passées (payées)
  PERFORM insert_test_contribution(v_group1_id, v_alice_id, 100.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group1_id, v_bob_id, 100.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group1_id, v_claire_id, 100.00, 'paid', v_past_date1);
  
  PERFORM insert_test_contribution(v_group1_id, v_alice_id, 100.00, 'paid', v_past_date2);
  PERFORM insert_test_contribution(v_group1_id, v_bob_id, 100.00, 'paid', v_past_date2);
  PERFORM insert_test_contribution(v_group1_id, v_claire_id, 100.00, 'missed', v_past_date2);
  
  -- Contributions actuelles (en attente ou payées)
  PERFORM insert_test_contribution(v_group1_id, v_alice_id, 100.00, 'paid', v_current_date);
  PERFORM insert_test_contribution(v_group1_id, v_bob_id, 100.00, 'pending', v_current_date);
  PERFORM insert_test_contribution(v_group1_id, v_claire_id, 100.00, 'pending', v_current_date);
  
  -- Contributions futures (planifiées)
  PERFORM insert_test_contribution(v_group1_id, v_alice_id, 100.00, 'pending', v_future_date1);
  PERFORM insert_test_contribution(v_group1_id, v_bob_id, 100.00, 'pending', v_future_date1);
  PERFORM insert_test_contribution(v_group1_id, v_claire_id, 100.00, 'pending', v_future_date1);
  
  -- Contributions pour le Groupe 2 (Groupe d'Amis)
  -- Contributions passées (payées)
  PERFORM insert_test_contribution(v_group2_id, v_bob_id, 50.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group2_id, v_alice_id, 50.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group2_id, v_claire_id, 50.00, 'paid', v_past_date1);
  
  -- Contributions actuelles (en attente ou payées)
  PERFORM insert_test_contribution(v_group2_id, v_bob_id, 50.00, 'paid', v_current_date);
  PERFORM insert_test_contribution(v_group2_id, v_alice_id, 50.00, 'paid', v_current_date);
  PERFORM insert_test_contribution(v_group2_id, v_claire_id, 50.00, 'pending', v_current_date);
  
  -- Contributions pour le Groupe 3 (Groupe de Collègues)
  -- Contributions passées (payées)
  PERFORM insert_test_contribution(v_group3_id, v_claire_id, 200.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group3_id, v_alice_id, 200.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group3_id, v_bob_id, 200.00, 'paid', v_past_date1);
  PERFORM insert_test_contribution(v_group3_id, v_david_id, 200.00, 'paid', v_past_date1);
  
  -- Paiements pour le Groupe 1 (Groupe Familial)
  -- Paiement passé (payé à Alice)
  PERFORM insert_test_payout(v_group1_id, v_alice_id, 300.00, 'paid', v_past_date1);
  
  -- Paiement passé (payé à Bob)
  PERFORM insert_test_payout(v_group1_id, v_bob_id, 300.00, 'paid', v_past_date2);
  
  -- Paiement futur (prévu pour Claire)
  PERFORM insert_test_payout(v_group1_id, v_claire_id, 300.00, 'scheduled', v_future_date1);
  
  -- Paiements pour le Groupe 2 (Groupe d'Amis)
  -- Paiement passé (payé à Claire)
  PERFORM insert_test_payout(v_group2_id, v_claire_id, 150.00, 'paid', v_past_date1);
  
  -- Paiement actuel (en attente pour Alice)
  PERFORM insert_test_payout(v_group2_id, v_alice_id, 150.00, 'pending', v_current_date);
  
  -- Paiement futur (prévu pour Bob)
  PERFORM insert_test_payout(v_group2_id, v_bob_id, 150.00, 'scheduled', v_future_date1);
  
  -- Paiements pour le Groupe 3 (Groupe de Collègues)
  -- Paiement passé (payé à David)
  PERFORM insert_test_payout(v_group3_id, v_david_id, 800.00, 'paid', v_past_date1);
  
  -- Paiement futur (prévu pour Alice)
  PERFORM insert_test_payout(v_group3_id, v_alice_id, 800.00, 'scheduled', v_future_date1);
  
  RAISE NOTICE 'Contributions et paiements de test insérés avec succès';
END $$;
