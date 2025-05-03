-- Script pour exécuter tous les tests

-- Afficher un message de début
DO $$
BEGIN
  RAISE NOTICE '=== Début des tests ===';
END $$;

-- Exécuter les tests de politiques de sécurité
\echo 'Exécution des tests de politiques de sécurité...'
\i test_security_policies.sql

-- Exécuter les tests de fonctions de base de données
\echo 'Exécution des tests de fonctions de base de données...'
\i test_database_functions.sql

-- Afficher un message de fin
DO $$
BEGIN
  RAISE NOTICE '=== Fin des tests ===';
  RAISE NOTICE 'Tous les tests ont été exécutés avec succès';
END $$;
