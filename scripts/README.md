# Scripts utilitaires pour l'application Naat

Ce dossier contient des scripts utilitaires pour l'application Naat.

## Scripts disponibles

### `check-database.js`

Script pour vérifier la connexion à la base de données Supabase et les tables existantes.

```bash
node scripts/check-database.js
```

### `test-app.js`

Script pour tester l'application avec la nouvelle base de données.

```bash
node scripts/test-app.js
```

### `run-app.sh`

Script pour exécuter l'application et vérifier qu'elle fonctionne correctement.

```bash
./scripts/run-app.sh
```

## Configuration de la base de données

Pour configurer la base de données Supabase, suivez ces étapes :

1. Connectez-vous au tableau de bord Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans l'éditeur SQL
4. Exécutez les scripts de migration dans l'ordre :
   - `supabase/migrations/20240611_initial_schema.sql`
   - `supabase/migrations/20240612_security_policies.sql`
   - `supabase/migrations/20240613_database_functions.sql`
5. Exécutez les scripts de données de test :
   - `supabase/seed/00_run_all_seeds.sql`
6. Exécutez les scripts de test :
   - `supabase/tests/run_all_tests.sql`

## Informations de connexion Supabase

- **URL du projet** : `https://zctvkxwnrhxdiuzuptof.supabase.co`
- **Clé API (anon/public)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8`
