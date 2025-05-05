# Configuration et Test de la Base de Données Supabase

Ce document explique comment configurer et tester la base de données Supabase pour l'application Naat (anciennement Modern Tontine).

## Configuration de la Base de Données

### 1. Exécuter les Scripts de Migration

Les scripts de migration créent les tables, les types et les fonctions nécessaires dans la base de données Supabase.

```bash
# Exécuter les scripts de migration dans l'ordre
supabase db run --file supabase/migrations/20240611_initial_schema.sql
supabase db run --file supabase/migrations/20240612_security_policies.sql
supabase db run --file supabase/migrations/20240613_database_functions.sql
```

### 2. Exécuter les Scripts de Données de Test

Les scripts de données de test remplissent la base de données avec des données de test.

```bash
# Exécuter le script principal qui exécute tous les scripts de données de test
supabase db run --file supabase/seed/00_run_all_seeds.sql
```

### 3. Tester la Base de Données

Utilisez le script de test pour vérifier que la base de données est correctement configurée.

```bash
# Exécuter le script de test
node scripts/test-app.js
```

## Structure de la Base de Données

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

## Fonctions de Base de Données

La base de données contient les fonctions suivantes :

- `has_role(role TEXT)` - Vérifie si l'utilisateur actuel a un rôle spécifique
- `is_admin()` - Vérifie si l'utilisateur actuel est un administrateur
- `is_group_admin(group_id INTEGER)` - Vérifie si l'utilisateur actuel est administrateur d'un groupe
- `get_app_stats()` - Récupère des statistiques sur l'application
- `search_users(p_search_term TEXT)` - Recherche des utilisateurs par nom ou email

## Résolution des Problèmes

### Tables Inaccessibles

Si certaines tables sont inaccessibles, cela peut être dû à des problèmes de politiques de sécurité RLS (Row Level Security). Vous pouvez essayer les solutions suivantes :

1. Vérifier que les tables existent dans la base de données :

```bash
node scripts/check-tables-exist.js
```

2. Corriger les politiques RLS pour les tables inaccessibles :

```bash
node scripts/fix-rls-direct.js
```

3. Si les tables n'existent pas, les créer :

```bash
node scripts/create-missing-tables.js
```

### Fonction `has_role` Manquante

Si la fonction `has_role` est manquante, vous pouvez la créer avec le script suivant :

```bash
node scripts/fix-has-role-direct.js
```

### Récursion Infinie dans les Politiques RLS

Si vous rencontrez une erreur de récursion infinie dans les politiques RLS, vous pouvez corriger ce problème avec le script suivant :

```bash
node scripts/fix-recursion.js
```

## Notes Importantes

- Les scripts de test et de correction supposent que vous avez configuré les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans un fichier `.env` à la racine du projet.
- Si vous n'avez pas configuré ces variables, les scripts utiliseront les valeurs par défaut codées en dur.
- Les scripts de test et de correction sont conçus pour être exécutés dans un environnement de développement et ne doivent pas être utilisés en production.
