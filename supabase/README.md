# Configuration de la base de données Supabase

Ce dossier contient les fichiers de configuration et de migration pour la base de données Supabase.

## Informations de connexion

- **URL du projet** : `https://zctvkxwnrhxdiuzuptof.supabase.co`
- **Clé API (anon/public)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8`

## Configuration initiale

Pour configurer la base de données Supabase, suivez ces étapes :

1. Connectez-vous au tableau de bord Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans l'éditeur SQL
4. Exécutez le script de migration initial : `20240611_initial_schema.sql`

## Structure de la base de données

La base de données contient les tables suivantes :

- `profiles` : Profils des utilisateurs
- `tontine_groups` : Groupes de tontine
- `group_members` : Membres des groupes
- `contributions` : Contributions des membres
- `payouts` : Paiements aux membres
- `services` : Services disponibles
- `user_services` : Abonnements des utilisateurs aux services
- `messages` : Messages dans les groupes
- `notifications` : Notifications des utilisateurs
- `user_points` : Points de fidélité des utilisateurs
- `achievements` : Réalisations disponibles
- `user_achievements` : Réalisations débloquées par les utilisateurs
- `promo_codes` : Codes promotionnels
- `user_roles` : Rôles des utilisateurs

## Sécurité

Toutes les tables ont la sécurité au niveau des lignes (RLS) activée. Des politiques de base sont définies pour :

- Permettre aux utilisateurs de voir tous les profils
- Permettre aux utilisateurs de mettre à jour leur propre profil
- Permettre aux utilisateurs de voir les groupes dont ils sont membres

## Fonctions utilitaires

Deux fonctions utilitaires sont définies :

- `is_group_admin(group_id)` : Vérifie si l'utilisateur actuel est administrateur d'un groupe
- `has_role(role)` : Vérifie si l'utilisateur actuel a un rôle spécifique
