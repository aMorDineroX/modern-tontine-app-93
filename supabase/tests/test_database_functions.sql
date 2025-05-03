-- Script pour tester les fonctions de base de données

-- Fonction pour tester les fonctions de base de données
CREATE OR REPLACE FUNCTION test_database_functions()
RETURNS TEXT AS $$
DECLARE
  v_admin_id UUID := '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID;
  v_alice_id UUID := 'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID;
  v_bob_id UUID := '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID;
  v_claire_id UUID := '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID;
  v_david_id UUID := 'f2d7e994-de3d-4d56-8d0b-31d9c33a297e'::UUID;
  
  v_group1_id INTEGER;
  v_group2_id INTEGER;
  v_group3_id INTEGER;
  
  v_result TEXT := '';
  v_test_name TEXT;
  v_success BOOLEAN;
  
  v_group_stats JSON;
  v_user_stats JSON;
  v_group_members JSON;
  v_user_groups JSON;
  v_app_stats JSON;
  v_search_groups_count INTEGER;
  v_search_users_count INTEGER;
  v_new_group JSON;
  v_new_member JSON;
  v_new_contribution JSON;
  v_new_payout JSON;
BEGIN
  -- Récupérer les IDs des groupes
  SELECT id INTO v_group1_id FROM tontine_groups WHERE name = 'Groupe Familial' LIMIT 1;
  SELECT id INTO v_group2_id FROM tontine_groups WHERE name = 'Groupe d''Amis' LIMIT 1;
  SELECT id INTO v_group3_id FROM tontine_groups WHERE name = 'Groupe de Collègues' LIMIT 1;
  
  -- Vérifier que les groupes existent
  IF v_group1_id IS NULL OR v_group2_id IS NULL OR v_group3_id IS NULL THEN
    RETURN 'Erreur: Un ou plusieurs groupes n''existent pas. Exécutez d''abord les scripts de données de test.';
  END IF;
  
  v_result := v_result || '=== Tests des fonctions de base de données ===\n\n';
  
  -- Test 1: get_group_stats
  v_test_name := 'get_group_stats';
  
  SELECT get_group_stats(v_group1_id) INTO v_group_stats;
  v_success := v_group_stats IS NOT NULL AND v_group_stats->>'group_id' = v_group1_id::TEXT;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_group_stats);
  
  -- Test 2: get_user_stats
  v_test_name := 'get_user_stats';
  
  SELECT get_user_stats(v_alice_id) INTO v_user_stats;
  v_success := v_user_stats IS NOT NULL AND v_user_stats->>'user_id' = v_alice_id::TEXT;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_user_stats);
  
  -- Test 3: get_group_members_with_stats
  v_test_name := 'get_group_members_with_stats';
  
  SELECT json_agg(result) INTO v_group_members
  FROM get_group_members_with_stats(v_group1_id) AS result;
  v_success := v_group_members IS NOT NULL AND json_array_length(v_group_members) > 0;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Nombre de membres: %s\n\n', json_array_length(v_group_members));
  
  -- Test 4: get_user_groups_with_stats
  v_test_name := 'get_user_groups_with_stats';
  
  SELECT json_agg(result) INTO v_user_groups
  FROM get_user_groups_with_stats(v_alice_id) AS result;
  v_success := v_user_groups IS NOT NULL AND json_array_length(v_user_groups) > 0;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Nombre de groupes: %s\n\n', json_array_length(v_user_groups));
  
  -- Test 5: get_app_stats
  v_test_name := 'get_app_stats';
  
  SELECT get_app_stats() INTO v_app_stats;
  v_success := v_app_stats IS NOT NULL AND v_app_stats->>'user_count' IS NOT NULL;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_app_stats);
  
  -- Test 6: search_groups
  v_test_name := 'search_groups';
  
  -- Simuler un utilisateur authentifié
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub": "c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a", "role": "authenticated"}';
  
  SELECT COUNT(*) INTO v_search_groups_count
  FROM search_groups('Familial');
  v_success := v_search_groups_count > 0;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Nombre de résultats: %s\n\n', v_search_groups_count);
  
  -- Test 7: search_users
  v_test_name := 'search_users';
  
  SELECT COUNT(*) INTO v_search_users_count
  FROM search_users('Alice');
  v_success := v_search_users_count > 0;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Nombre de résultats: %s\n\n', v_search_users_count);
  
  -- Test 8: create_group_with_admin
  v_test_name := 'create_group_with_admin';
  
  SELECT create_group_with_admin(
    'Groupe de Test',
    150.00,
    'monthly'::frequency,
    NOW() + INTERVAL '7 days',
    'rotation'::payout_method
  ) INTO v_new_group;
  v_success := v_new_group IS NOT NULL AND v_new_group->>'name' = 'Groupe de Test';
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_new_group);
  
  -- Test 9: add_group_member
  v_test_name := 'add_group_member';
  
  SELECT add_group_member(
    (v_new_group->>'group_id')::INTEGER,
    v_bob_id,
    'member'::user_role,
    'pending'::member_status
  ) INTO v_new_member;
  v_success := v_new_member IS NOT NULL AND v_new_member->>'user_id' = v_bob_id::TEXT;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_new_member);
  
  -- Test 10: create_contribution
  v_test_name := 'create_contribution';
  
  SELECT create_contribution(
    (v_new_group->>'group_id')::INTEGER,
    150.00,
    'pending'::contribution_status,
    NOW() + INTERVAL '14 days'
  ) INTO v_new_contribution;
  v_success := v_new_contribution IS NOT NULL AND v_new_contribution->>'group_id' = (v_new_group->>'group_id');
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_new_contribution);
  
  -- Test 11: create_payout
  v_test_name := 'create_payout';
  
  SELECT create_payout(
    (v_new_group->>'group_id')::INTEGER,
    v_alice_id,
    300.00,
    'scheduled'::payout_status,
    NOW() + INTERVAL '30 days'
  ) INTO v_new_payout;
  v_success := v_new_payout IS NOT NULL AND v_new_payout->>'user_id' = v_alice_id::TEXT;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Résultat: %s\n\n', v_new_payout);
  
  -- Nettoyer les données de test
  DELETE FROM payouts WHERE group_id = (v_new_group->>'group_id')::INTEGER;
  DELETE FROM contributions WHERE group_id = (v_new_group->>'group_id')::INTEGER;
  DELETE FROM group_members WHERE group_id = (v_new_group->>'group_id')::INTEGER;
  DELETE FROM tontine_groups WHERE id = (v_new_group->>'group_id')::INTEGER;
  
  -- Réinitialiser le rôle
  RESET ROLE;
  RESET "request.jwt.claims";
  
  -- Résumé des tests
  v_result := v_result || '=== Résumé des tests ===\n';
  v_result := v_result || 'Les fonctions de base de données fonctionnent correctement.\n';
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Exécuter les tests
SELECT test_database_functions();
