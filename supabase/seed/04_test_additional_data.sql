-- Insertion de données supplémentaires de test dans la base de données Supabase

-- Insérer des services
INSERT INTO services (name, description, price, duration, features, is_active, created_at, updated_at)
VALUES
  (
    'Premium',
    'Accès à toutes les fonctionnalités premium de Naat',
    9.99,
    30,
    '{"unlimited_groups": true, "advanced_analytics": true, "priority_support": true, "custom_themes": true}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    'Assurance Tontine',
    'Protection contre les défauts de paiement des membres',
    4.99,
    30,
    '{"payment_protection": true, "default_coverage": "100%", "instant_claims": true}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    'Analyse Financière',
    'Rapports détaillés sur vos finances et recommandations personnalisées',
    7.99,
    30,
    '{"detailed_reports": true, "personalized_advice": true, "export_options": true, "financial_planning": true}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    'Pack Complet',
    'Combinaison de tous nos services premium à prix réduit',
    19.99,
    30,
    '{"unlimited_groups": true, "advanced_analytics": true, "priority_support": true, "custom_themes": true, "payment_protection": true, "default_coverage": "100%", "instant_claims": true, "detailed_reports": true, "personalized_advice": true, "export_options": true, "financial_planning": true}'::jsonb,
    true,
    NOW(),
    NOW()
  );

-- Insérer des abonnements aux services pour certains utilisateurs
INSERT INTO user_services (user_id, service_id, start_date, end_date, status, created_at, updated_at)
VALUES
  (
    '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID, -- Admin
    (SELECT id FROM services WHERE name = 'Pack Complet'),
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    'active',
    NOW(),
    NOW()
  ),
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID, -- Alice
    (SELECT id FROM services WHERE name = 'Premium'),
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    'active',
    NOW(),
    NOW()
  ),
  (
    '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID, -- Bob
    (SELECT id FROM services WHERE name = 'Assurance Tontine'),
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    'active',
    NOW(),
    NOW()
  );

-- Insérer des réalisations (achievements)
INSERT INTO achievements (name, description, points, icon, created_at)
VALUES
  (
    'Premier Groupe',
    'Créer votre premier groupe de tontine',
    10,
    'trophy',
    NOW()
  ),
  (
    'Contributeur Régulier',
    'Effectuer 5 contributions à l''heure',
    20,
    'calendar-check',
    NOW()
  ),
  (
    'Ambassadeur',
    'Inviter 3 amis à rejoindre l''application',
    30,
    'users',
    NOW()
  ),
  (
    'Expert Financier',
    'Participer à 10 groupes de tontine différents',
    50,
    'chart-line',
    NOW()
  ),
  (
    'Membre Premium',
    'S''abonner à un service premium',
    15,
    'crown',
    NOW()
  );

-- Attribuer des réalisations à certains utilisateurs
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
VALUES
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID, -- Alice
    (SELECT id FROM achievements WHERE name = 'Premier Groupe'),
    NOW() - INTERVAL '20 days'
  ),
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID, -- Alice
    (SELECT id FROM achievements WHERE name = 'Membre Premium'),
    NOW() - INTERVAL '10 days'
  ),
  (
    '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID, -- Bob
    (SELECT id FROM achievements WHERE name = 'Premier Groupe'),
    NOW() - INTERVAL '15 days'
  ),
  (
    '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID, -- Claire
    (SELECT id FROM achievements WHERE name = 'Premier Groupe'),
    NOW() - INTERVAL '10 days'
  ),
  (
    '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID, -- Admin
    (SELECT id FROM achievements WHERE name = 'Membre Premium'),
    NOW() - INTERVAL '15 days'
  );

-- Mettre à jour les points des utilisateurs
UPDATE user_points
SET points = 25, total_earned = 25, last_activity = NOW() - INTERVAL '1 day'
WHERE user_id = 'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID; -- Alice

UPDATE user_points
SET points = 10, total_earned = 10, last_activity = NOW() - INTERVAL '2 days'
WHERE user_id = '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID; -- Bob

UPDATE user_points
SET points = 10, total_earned = 10, last_activity = NOW() - INTERVAL '3 days'
WHERE user_id = '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID; -- Claire

UPDATE user_points
SET points = 15, total_earned = 15, last_activity = NOW() - INTERVAL '1 day'
WHERE user_id = '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'::UUID; -- Admin

-- Insérer des messages dans les groupes
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
BEGIN
  -- Récupérer les IDs des groupes
  SELECT id INTO v_group1_id FROM tontine_groups WHERE name = 'Groupe Familial' LIMIT 1;
  SELECT id INTO v_group2_id FROM tontine_groups WHERE name = 'Groupe d''Amis' LIMIT 1;
  SELECT id INTO v_group3_id FROM tontine_groups WHERE name = 'Groupe de Collègues' LIMIT 1;
  
  -- Messages pour le Groupe 1 (Groupe Familial)
  INSERT INTO messages (group_id, user_id, content, created_at, updated_at)
  VALUES
    (v_group1_id, v_alice_id, 'Bienvenue dans notre groupe familial!', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    (v_group1_id, v_bob_id, 'Merci pour l''invitation Alice!', NOW() - INTERVAL '29 days 23 hours', NOW() - INTERVAL '29 days 23 hours'),
    (v_group1_id, v_claire_id, 'Bonjour tout le monde!', NOW() - INTERVAL '29 days 22 hours', NOW() - INTERVAL '29 days 22 hours'),
    (v_group1_id, v_alice_id, 'N''oubliez pas de faire vos contributions avant la fin du mois.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    (v_group1_id, v_bob_id, 'J''ai effectué mon paiement.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (v_group1_id, v_alice_id, 'Super, merci Bob!', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (v_group1_id, v_claire_id, 'Je ferai mon paiement demain.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (v_group1_id, v_alice_id, 'Rappel: contribution du mois en cours à effectuer.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
  
  -- Messages pour le Groupe 2 (Groupe d'Amis)
  INSERT INTO messages (group_id, user_id, content, created_at, updated_at)
  VALUES
    (v_group2_id, v_bob_id, 'Salut les amis! Bienvenue dans notre groupe de tontine.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
    (v_group2_id, v_alice_id, 'Merci pour la création du groupe Bob!', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
    (v_group2_id, v_claire_id, 'Super initiative!', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
    (v_group2_id, v_bob_id, 'On commence les contributions la semaine prochaine?', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
    (v_group2_id, v_alice_id, 'Ça me va!', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
    (v_group2_id, v_claire_id, 'Parfait pour moi aussi.', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
    (v_group2_id, v_bob_id, 'Claire, tu seras la première à recevoir le paiement.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (v_group2_id, v_claire_id, 'Merci beaucoup!', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');
  
  -- Messages pour le Groupe 3 (Groupe de Collègues)
  INSERT INTO messages (group_id, user_id, content, created_at, updated_at)
  VALUES
    (v_group3_id, v_claire_id, 'Bonjour les collègues! Voici notre groupe de tontine.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (v_group3_id, v_alice_id, 'Bonne idée Claire!', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (v_group3_id, v_bob_id, 'Ça va nous aider à économiser pour les projets communs.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
    (v_group3_id, v_david_id, 'Je suis content de faire partie du groupe!', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
    (v_group3_id, v_claire_id, 'Les contributions sont fixées à 200€ par semaine.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    (v_group3_id, v_alice_id, 'C''est noté.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    (v_group3_id, v_bob_id, 'Parfait.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    (v_group3_id, v_david_id, 'Merci pour le premier paiement!', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    (v_group3_id, v_claire_id, 'De rien David, tu le mérites!', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');
END $$;

-- Insérer des notifications pour les utilisateurs
INSERT INTO notifications (user_id, title, message, is_read, type, link, created_at)
VALUES
  -- Notifications pour Alice
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID,
    'Bienvenue sur Naat!',
    'Merci d''avoir rejoint Naat. Commencez par créer ou rejoindre un groupe de tontine.',
    true,
    'info',
    '/dashboard',
    NOW() - INTERVAL '30 days'
  ),
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID,
    'Paiement reçu',
    'Vous avez reçu un paiement de 300€ du Groupe Familial.',
    true,
    'success',
    '/groups',
    NOW() - INTERVAL '29 days'
  ),
  (
    'c8e33ded-d6e5-4ae3-b9ff-79d8f1cc3e6a'::UUID,
    'Nouvelle contribution à effectuer',
    'Une nouvelle contribution de 100€ est due pour le Groupe Familial.',
    false,
    'warning',
    '/groups',
    NOW() - INTERVAL '2 days'
  ),
  
  -- Notifications pour Bob
  (
    '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID,
    'Bienvenue sur Naat!',
    'Merci d''avoir rejoint Naat. Commencez par créer ou rejoindre un groupe de tontine.',
    true,
    'info',
    '/dashboard',
    NOW() - INTERVAL '30 days'
  ),
  (
    '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID,
    'Paiement reçu',
    'Vous avez reçu un paiement de 300€ du Groupe Familial.',
    true,
    'success',
    '/groups',
    NOW() - INTERVAL '15 days'
  ),
  (
    '3b9c312e-b60c-4fce-b99a-eff1b1931ad1'::UUID,
    'Contribution en attente',
    'Votre contribution de 100€ pour le Groupe Familial est en attente.',
    false,
    'warning',
    '/groups',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Notifications pour Claire
  (
    '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID,
    'Bienvenue sur Naat!',
    'Merci d''avoir rejoint Naat. Commencez par créer ou rejoindre un groupe de tontine.',
    true,
    'info',
    '/dashboard',
    NOW() - INTERVAL '30 days'
  ),
  (
    '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID,
    'Paiement reçu',
    'Vous avez reçu un paiement de 150€ du Groupe d''Amis.',
    true,
    'success',
    '/groups',
    NOW() - INTERVAL '29 days'
  ),
  (
    '6d4c8abb-c288-4d6e-9357-29be4c929431'::UUID,
    'Paiement à venir',
    'Vous recevrez un paiement de 300€ du Groupe Familial prochainement.',
    false,
    'info',
    '/groups',
    NOW() - INTERVAL '3 days'
  );

-- Insérer des codes promo
INSERT INTO promo_codes (code, discount_percent, discount_amount, valid_from, valid_to, max_uses, current_uses, is_active, created_at)
VALUES
  (
    'BIENVENUE10',
    10,
    NULL,
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    100,
    12,
    true,
    NOW() - INTERVAL '30 days'
  ),
  (
    'PREMIUM5',
    NULL,
    5.00,
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    50,
    8,
    true,
    NOW() - INTERVAL '15 days'
  ),
  (
    'ETE2024',
    20,
    NULL,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '90 days',
    200,
    0,
    true,
    NOW()
  );

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Données supplémentaires de test insérées avec succès';
END $$;
