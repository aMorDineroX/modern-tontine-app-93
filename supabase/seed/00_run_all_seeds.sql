-- Script principal pour exécuter tous les scripts de données de test

-- Afficher un message de début
DO $$
BEGIN
  RAISE NOTICE '=== Début de l''insertion des données de test ===';
END $$;

-- Exécuter les scripts dans l'ordre
\i 01_test_users.sql
\i 02_test_groups.sql
\i 03_test_contributions_payouts.sql
\i 04_test_additional_data.sql

-- Afficher un message de fin
DO $$
BEGIN
  RAISE NOTICE '=== Fin de l''insertion des données de test ===';
  RAISE NOTICE 'Toutes les données de test ont été insérées avec succès';
END $$;
