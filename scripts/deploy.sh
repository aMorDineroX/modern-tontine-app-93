#!/bin/bash

# Script pour déployer l'application
# Utilisation: ./deploy.sh [environnement]
# Exemple: ./deploy.sh production

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Déterminer l'environnement
ENV=${1:-production}
echo "Déploiement vers l'environnement: $ENV"

# Demander confirmation avant de continuer
read -p "Êtes-vous sûr de vouloir déployer en $ENV? (y/n) " -n 1 -r
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

# Étape 1: Exécuter les tests
echo "Étape 1: Exécution des tests..."
./scripts/run-tests.sh --ci

# Vérifier si les tests ont réussi
if [ $? -ne 0 ]; then
    echo "❌ Les tests ont échoué. Déploiement annulé."
    exit 1
fi

echo "✅ Tests réussis."

# Étape 2: Vérifier le code
echo "Étape 2: Vérification du code..."
./scripts/code-review.sh --fix

# Vérifier si la vérification du code a réussi
if [ $? -ne 0 ]; then
    echo "⚠️ La vérification du code a détecté des problèmes."
    read -p "Voulez-vous continuer malgré les problèmes? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Déploiement annulé."
        exit 1
    fi
fi

# Étape 3: Construire l'application
echo "Étape 3: Construction de l'application..."
npm run build

# Vérifier si la construction a réussi
if [ $? -ne 0 ]; then
    echo "❌ La construction a échoué. Déploiement annulé."
    exit 1
fi

echo "✅ Construction réussie."

# Étape 4: Déployer les migrations Supabase
echo "Étape 4: Déploiement des migrations Supabase..."
./scripts/deploy-migrations-prod.sh $ENV

# Vérifier si le déploiement des migrations a réussi
if [ $? -ne 0 ]; then
    echo "❌ Le déploiement des migrations a échoué. Déploiement annulé."
    exit 1
fi

echo "✅ Migrations déployées avec succès."

# Étape 5: Déployer l'application
echo "Étape 5: Déploiement de l'application..."

# Vérifier la méthode de déploiement
if [ -n "$DEPLOY_COMMAND" ]; then
    # Utiliser la commande de déploiement spécifiée dans .env.$ENV
    eval "$DEPLOY_COMMAND"
elif [ -f "netlify.toml" ]; then
    # Déployer sur Netlify
    if ! command -v netlify &> /dev/null; then
        echo "Netlify CLI n'est pas installé. Installation en cours..."
        npm install -g netlify-cli
    fi
    
    netlify deploy --prod
elif [ -f "vercel.json" ]; then
    # Déployer sur Vercel
    if ! command -v vercel &> /dev/null; then
        echo "Vercel CLI n'est pas installé. Installation en cours..."
        npm install -g vercel
    fi
    
    vercel --prod
else
    echo "❌ Aucune méthode de déploiement détectée. Veuillez spécifier DEPLOY_COMMAND dans .env.$ENV."
    exit 1
fi

# Vérifier si le déploiement a réussi
if [ $? -ne 0 ]; then
    echo "❌ Le déploiement a échoué."
    exit 1
fi

echo "✅ Application déployée avec succès."

# Étape 6: Vérifier l'application déployée
echo "Étape 6: Vérification de l'application déployée..."

if [ -n "$DEPLOYED_URL" ]; then
    # Vérifier si l'application est accessible
    if curl -s "$DEPLOYED_URL" > /dev/null; then
        echo "✅ L'application est accessible à l'URL $DEPLOYED_URL."
        
        # Vérifier les performances
        echo "Vérification des performances..."
        ./scripts/monitor-performance.sh --url="$DEPLOYED_URL" --device=desktop --runs=1
        
        # Vérifier l'accessibilité
        echo "Vérification de l'accessibilité..."
        ./scripts/check-accessibility.sh --url="$DEPLOYED_URL"
    else
        echo "⚠️ L'application n'est pas accessible à l'URL $DEPLOYED_URL."
    fi
else
    echo "⚠️ URL de déploiement non spécifiée. Veuillez définir DEPLOYED_URL dans .env.$ENV pour activer les vérifications post-déploiement."
fi

echo "🎉 Déploiement terminé avec succès!"
