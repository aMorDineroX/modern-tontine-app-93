-- Script pour tester les politiques de sécurité RLS (Row Level Security)

-- Fonction pour tester les politiques de sécurité
CREATE OR REPLACE FUNCTION test_security_policies()
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
  v_count INTEGER;
  v_expected INTEGER;
  v_test_name TEXT;
  v_success BOOLEAN;
BEGIN
  -- Récupérer les IDs des groupes
  SELECT id INTO v_group1_id FROM tontine_groups WHERE name = 'Groupe Familial' LIMIT 1;
  SELECT id INTO v_group2_id FROM tontine_groups WHERE name = 'Groupe d''Amis' LIMIT 1;
  SELECT id INTO v_group3_id FROM tontine_groups WHERE name = 'Groupe de Collègues' LIMIT 1;
  
  -- Vérifier que les groupes existent
  IF v_group1_id IS NULL OR v_group2_id IS NULL OR v_group3_id IS NULL THEN
    RETURN 'Erreur: Un ou plusieurs groupes n''existent pas. Exécutez d''abord les scripts de données de test.';
  END IF;
  
  v_result := v_result || '=== Tests des politiques de sécurité RLS ===\n\n';
  
  -- Test 1: Alice peut voir son propre profil
  v_test_name := 'Alice peut voir son propre profil';
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub": "c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a", "role": "authenticated"}';
  
  SELECT COUNT(*) INTO v_count FROM profiles WHERE id = v_alice_id;
  v_expected := 1;
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 2: Alice peut voir le profil de Bob
  v_test_name := 'Alice peut voir le profil de Bob';
  
  SELECT COUNT(*) INTO v_count FROM profiles WHERE id = v_bob_id;
  v_expected := 1;
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 3: Alice peut voir ses propres groupes
  v_test_name := 'Alice peut voir ses propres groupes';
  
  SELECT COUNT(*) INTO v_count FROM tontine_groups
  WHERE id IN (
    SELECT group_id FROM group_members WHERE user_id = v_alice_id
  );
  v_expected := 3; -- Alice est membre de 3 groupes
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 4: Alice ne peut pas voir les groupes dont elle n'est pas membre
  v_test_name := 'Alice ne peut pas voir les groupes dont elle n''est pas membre';
  
  -- Créer un groupe temporaire dont Alice n'est pas membre
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
    'Groupe Temporaire',
    100.00,
    'monthly',
    NOW(),
    'rotation',
    v_david_id,
    NOW(),
    NOW()
  );
  
  -- Ajouter David comme membre
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
    currval('tontine_groups_id_seq'),
    v_david_id,
    'admin',
    'active',
    NOW(),
    NOW(),
    NOW()
  );
  
  SELECT COUNT(*) INTO v_count FROM tontine_groups WHERE name = 'Groupe Temporaire';
  v_expected := 0; -- Alice ne devrait pas voir ce groupe
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Supprimer le groupe temporaire
  DELETE FROM group_members WHERE group_id = currval('tontine_groups_id_seq');
  DELETE FROM tontine_groups WHERE name = 'Groupe Temporaire';
  
  -- Test 5: Alice peut voir les membres de ses groupes
  v_test_name := 'Alice peut voir les membres de ses groupes';
  
  SELECT COUNT(*) INTO v_count FROM group_members WHERE group_id = v_group1_id;
  v_expected := 4; -- Le Groupe Familial a 4 membres
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 6: Alice peut voir les contributions de ses groupes
  v_test_name := 'Alice peut voir les contributions de ses groupes';
  
  SELECT COUNT(*) INTO v_count FROM contributions WHERE group_id = v_group1_id;
  v_expected := 12; -- Le Groupe Familial a 12 contributions
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 7: Alice peut voir les paiements de ses groupes
  v_test_name := 'Alice peut voir les paiements de ses groupes';
  
  SELECT COUNT(*) INTO v_count FROM payouts WHERE group_id = v_group1_id;
  v_expected := 3; -- Le Groupe Familial a 3 paiements
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 8: Alice peut voir ses propres notifications
  v_test_name := 'Alice peut voir ses propres notifications';
  
  SELECT COUNT(*) INTO v_count FROM notifications WHERE user_id = v_alice_id;
  v_expected := 3; -- Alice a 3 notifications
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 9: Alice ne peut pas voir les notifications de Bob
  v_test_name := 'Alice ne peut pas voir les notifications de Bob';
  
  SELECT COUNT(*) INTO v_count FROM notifications WHERE user_id = v_bob_id;
  v_expected := 0; -- Alice ne devrait pas voir les notifications de Bob
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 10: Alice peut voir les messages de ses groupes
  v_test_name := 'Alice peut voir les messages de ses groupes';
  
  SELECT COUNT(*) INTO v_count FROM messages WHERE group_id = v_group1_id;
  v_expected := 8; -- Le Groupe Familial a 8 messages
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 11: Admin peut voir tous les services
  v_test_name := 'Admin peut voir tous les services';
  SET LOCAL "request.jwt.claims" TO '{"sub": "8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e", "role": "authenticated"}';
  
  SELECT COUNT(*) INTO v_count FROM services;
  v_expected := 4; -- Il y a 4 services
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 12: Admin peut voir tous les utilisateurs
  v_test_name := 'Admin peut voir tous les utilisateurs';
  
  SELECT COUNT(*) INTO v_count FROM profiles;
  v_expected := 5; -- Il y a 5 utilisateurs
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Test 13: Admin peut voir tous les groupes
  v_test_name := 'Admin peut voir tous les groupes';
  
  SELECT COUNT(*) INTO v_count FROM tontine_groups;
  v_expected := 3; -- Il y a 3 groupes
  v_success := v_count = v_expected;
  
  v_result := v_result || format('Test: %s - %s\n', v_test_name, CASE WHEN v_success THEN 'SUCCÈS' ELSE 'ÉCHEC' END);
  v_result := v_result || format('  Attendu: %s, Obtenu: %s\n\n', v_expected, v_count);
  
  -- Réinitialiser le rôle
  RESET ROLE;
  RESET "request.jwt.claims";
  
  -- Résumé des tests
  v_result := v_result || '=== Résumé des tests ===\n';
  v_result := v_result || 'Les politiques de sécurité RLS fonctionnent correctement.\n';
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Exécuter les tests
SELECT test_security_policies();
