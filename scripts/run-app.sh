#!/bin/bash

# Script pour exécuter l'application et vérifier qu'elle fonctionne correctement

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message d'information
info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Fonction pour afficher un message de succès
success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Fonction pour afficher un message d'avertissement
warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Fonction pour afficher un message d'erreur
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
  error "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
  exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
  error "npm n'est pas installé. Veuillez l'installer avant de continuer."
  exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
  warning "Les dépendances ne sont pas installées. Installation en cours..."
  npm install
  if [ $? -ne 0 ]; then
    error "Erreur lors de l'installation des dépendances."
    exit 1
  fi
  success "Dépendances installées avec succès."
fi

# Vérifier la connexion à la base de données
info "Vérification de la connexion à la base de données..."
node scripts/check-database.js
if [ $? -ne 0 ]; then
  error "Erreur lors de la vérification de la connexion à la base de données."
  exit 1
fi

# Tester l'application avec la nouvelle base de données
info "Test de l'application avec la nouvelle base de données..."
node scripts/test-app.js
if [ $? -ne 0 ]; then
  error "Erreur lors du test de l'application avec la nouvelle base de données."
  exit 1
fi

# Démarrer l'application
info "Démarrage de l'application..."
npm run dev
