#!/bin/bash

# Script pour appliquer les migrations Supabase

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

# Démarrer Supabase en local (si nécessaire)
echo "Démarrage de Supabase en local..."
supabase start

# Appliquer les migrations
echo "Application des migrations..."
supabase db reset

echo "Migrations appliquées avec succès!"

# Générer les types TypeScript
echo "Génération des types TypeScript..."
supabase gen types typescript --local > src/types/supabase.ts

echo "Types TypeScript générés avec succès!"

echo "Processus terminé. Votre base de données Supabase est à jour."
