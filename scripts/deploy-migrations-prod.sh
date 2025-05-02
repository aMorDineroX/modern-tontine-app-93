#!/bin/bash

# Script pour déployer les migrations Supabase en production
# Utilisation: ./deploy-migrations-prod.sh [environnement]
# Exemple: ./deploy-migrations-prod.sh production

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    echo "Instructions: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Vérifier si le projet Supabase est initialisé
if [ ! -d "supabase" ]; then
    echo "Le dossier 'supabase' n'existe pas. Veuillez initialiser le projet Supabase d'abord."
    echo "Exécutez: supabase init"
    exit 1
fi

# Déterminer l'environnement
ENV=${1:-production}
echo "Déploiement des migrations vers l'environnement: $ENV"

# Demander confirmation avant de continuer
read -p "Êtes-vous sûr de vouloir déployer les migrations en $ENV? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Déploiement annulé."
    exit 1
fi

# Vérifier si le fichier .env.$ENV existe
if [ ! -f ".env.$ENV" ]; then
    echo "Le fichier .env.$ENV n'existe pas. Veuillez le créer avec les variables d'environnement nécessaires."
    exit 1
fi

# Charger les variables d'environnement
source .env.$ENV

# Vérifier si les variables nécessaires sont définies
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "Les variables SUPABASE_URL et SUPABASE_KEY doivent être définies dans .env.$ENV"
    exit 1
fi

echo "Connexion à Supabase..."
supabase link --project-ref "$SUPABASE_PROJECT_ID"

echo "Création d'une sauvegarde de la base de données..."
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
supabase db dump -f "$BACKUP_DIR/backup_$ENV_$BACKUP_DATE.sql"
echo "Sauvegarde créée: $BACKUP_DIR/backup_$ENV_$BACKUP_DATE.sql"

echo "Déploiement des migrations..."
supabase db push

echo "Génération des types TypeScript..."
supabase gen types typescript --linked > src/types/supabase.ts

echo "Migrations déployées avec succès en $ENV!"
echo "N'oubliez pas de vérifier que tout fonctionne correctement."
