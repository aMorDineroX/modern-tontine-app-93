# Configuration de Supabase pour Naat

Ce document explique comment configurer Supabase pour l'application Naat.

## Informations de connexion

- **URL du projet** : `https://zctvkxwnrhxdiuzuptof.supabase.co`
- **Clé API (anon/public)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8`

## Étapes de configuration

### 1. Exécuter les scripts de migration

Connectez-vous au tableau de bord Supabase et exécutez les scripts de migration dans l'ordre suivant :

1. `supabase/migrations/20240611_initial_schema.sql` - Crée les tables et les types
2. `supabase/migrations/20240612_security_policies.sql` - Configure les politiques de sécurité RLS
3. `supabase/migrations/20240613_database_functions.sql` - Ajoute des fonctions de base de données utiles

### 2. Exécuter les scripts de données de test

Exécutez les scripts de données de test pour remplir la base de données avec des données de test :

1. `supabase/seed/00_run_all_seeds.sql` - Exécute tous les scripts de données de test

### 3. Exécuter les scripts de test

Exécutez les scripts de test pour vérifier que tout fonctionne correctement :

1. `supabase/tests/run_all_tests.sql` - Exécute tous les scripts de test

## Structure de la base de données

La base de données contient les tables suivantes :

- `profiles` - Profils des utilisateurs
- `tontine_groups` - Groupes de tontine
- `group_members` - Membres des groupes
- `contributions` - Contributions des membres
- `payouts` - Paiements aux membres
- `services` - Services disponibles
- `user_services` - Abonnements des utilisateurs aux services
- `messages` - Messages dans les groupes
- `notifications` - Notifications des utilisateurs
- `user_points` - Points de fidélité des utilisateurs
- `achievements` - Réalisations disponibles
- `user_achievements` - Réalisations débloquées par les utilisateurs
- `promo_codes` - Codes promotionnels
- `user_roles` - Rôles des utilisateurs

## Fonctions de base de données

Les fonctions de base de données suivantes sont disponibles :

- `get_group_stats(p_group_id)` - Obtient les statistiques d'un groupe
- `get_user_stats(p_user_id)` - Obtient les statistiques d'un utilisateur
- `get_group_members_with_stats(p_group_id)` - Obtient les membres d'un groupe avec leurs statistiques
- `get_user_groups_with_stats(p_user_id)` - Obtient les groupes d'un utilisateur avec leurs statistiques
- `create_group_with_admin(p_name, p_contribution_amount, p_frequency, p_start_date, p_payout_method)` - Crée un nouveau groupe et ajoute le créateur comme membre admin
- `add_group_member(p_group_id, p_user_id, p_role, p_status)` - Ajoute un membre à un groupe
- `create_contribution(p_group_id, p_amount, p_status, p_payment_date)` - Crée une contribution
- `create_payout(p_group_id, p_user_id, p_amount, p_status, p_payout_date)` - Crée un paiement
- `get_app_stats()` - Obtient les statistiques globales de l'application
- `search_groups(p_search_term)` - Recherche des groupes
- `search_users(p_search_term)` - Recherche des utilisateurs

## Politiques de sécurité

Toutes les tables ont la sécurité au niveau des lignes (RLS) activée. Des politiques de base sont définies pour :

- Permettre aux utilisateurs de voir tous les profils
- Permettre aux utilisateurs de mettre à jour leur propre profil
- Permettre aux utilisateurs de voir les groupes dont ils sont membres
- Permettre aux administrateurs de groupe de gérer les membres
- Permettre aux utilisateurs de voir les contributions et les paiements de leurs groupes
- Permettre aux utilisateurs de voir leurs propres notifications
- Permettre aux utilisateurs de voir les messages de leurs groupes

## Scripts utilitaires

Les scripts utilitaires suivants sont disponibles :

- `scripts/check-database.js` - Vérifie la connexion à la base de données et les tables existantes
- `scripts/test-app.js` - Teste l'application avec la nouvelle base de données
- `scripts/run-app.sh` - Exécute l'application et vérifie qu'elle fonctionne correctement

## Prochaines étapes

1. Exécuter les scripts de migration sur le tableau de bord Supabase
2. Exécuter les scripts de données de test
3. Exécuter les scripts de test
4. Exécuter l'application avec la nouvelle base de données
5. Vérifier que tout fonctionne correctement
