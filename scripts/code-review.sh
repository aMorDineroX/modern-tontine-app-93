#!/bin/bash

# Script pour faciliter la revue de code
# Utilisation: ./code-review.sh [options]
# Options:
#   --fix: Corriger automatiquement les problèmes lorsque possible
#   --staged: Analyser uniquement les fichiers en staging
#   --component=<nom>: Analyser un composant spécifique

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Analyser les arguments
FIX_MODE=false
STAGED_MODE=false
COMPONENT=""

for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --staged)
      STAGED_MODE=true
      shift
      ;;
    --component=*)
      COMPONENT="${arg#*=}"
      shift
      ;;
  esac
done

# Créer le dossier de rapports s'il n'existe pas
mkdir -p reports

# Date pour les noms de fichiers
DATE=$(date +"%Y%m%d_%H%M%S")

# Fonction pour exécuter ESLint
run_eslint() {
  echo "🔍 Exécution d'ESLint..."
  
  ESLINT_OPTIONS="--ext .js,.jsx,.ts,.tsx"
  
  if [ "$FIX_MODE" = true ]; then
    ESLINT_OPTIONS="$ESLINT_OPTIONS --fix"
  fi
  
  if [ "$STAGED_MODE" = true ]; then
    git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx)$' > .eslint-staged-files
    if [ -s .eslint-staged-files ]; then
      npx eslint $ESLINT_OPTIONS $(cat .eslint-staged-files) | tee reports/eslint-report-$DATE.txt
    else
      echo "Aucun fichier JavaScript/TypeScript en staging."
    fi
    rm -f .eslint-staged-files
  elif [ -n "$COMPONENT" ]; then
    npx eslint $ESLINT_OPTIONS src/**/$COMPONENT*.{js,jsx,ts,tsx} | tee reports/eslint-report-$DATE.txt
  else
    npx eslint $ESLINT_OPTIONS . | tee reports/eslint-report-$DATE.txt
  fi
  
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Aucun problème ESLint détecté."
  else
    echo "⚠️ Des problèmes ESLint ont été détectés. Consultez le rapport pour plus de détails."
  fi
}

# Fonction pour exécuter TypeScript
run_typescript() {
  echo "🔍 Vérification des types TypeScript..."
  
  npx tsc --noEmit | tee reports/typescript-report-$DATE.txt
  
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Aucune erreur TypeScript détectée."
  else
    echo "⚠️ Des erreurs TypeScript ont été détectées. Consultez le rapport pour plus de détails."
  fi
}

# Fonction pour exécuter Prettier
run_prettier() {
  echo "🔍 Vérification du formatage avec Prettier..."
  
  PRETTIER_OPTIONS="--check"
  
  if [ "$FIX_MODE" = true ]; then
    PRETTIER_OPTIONS="--write"
  fi
  
  if [ "$STAGED_MODE" = true ]; then
    git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx|css|scss|json|md)$' > .prettier-staged-files
    if [ -s .prettier-staged-files ]; then
      npx prettier $PRETTIER_OPTIONS $(cat .prettier-staged-files) | tee reports/prettier-report-$DATE.txt
    else
      echo "Aucun fichier à formater en staging."
    fi
    rm -f .prettier-staged-files
  elif [ -n "$COMPONENT" ]; then
    npx prettier $PRETTIER_OPTIONS src/**/$COMPONENT*.{js,jsx,ts,tsx,css,scss} | tee reports/prettier-report-$DATE.txt
  else
    npx prettier $PRETTIER_OPTIONS "src/**/*.{js,jsx,ts,tsx,css,scss,json,md}" | tee reports/prettier-report-$DATE.txt
  fi
  
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Tous les fichiers sont correctement formatés."
  else
    echo "⚠️ Certains fichiers ne sont pas correctement formatés. Consultez le rapport pour plus de détails."
  fi
}

# Fonction pour analyser la complexité du code
run_complexity_analysis() {
  echo "🔍 Analyse de la complexité du code..."
  
  if [ ! -f node_modules/.bin/complexity-report ]; then
    echo "Installation de complexity-report..."
    npm install --save-dev complexity-report
  fi
  
  if [ "$STAGED_MODE" = true ]; then
    git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx)$' > .complexity-staged-files
    if [ -s .complexity-staged-files ]; then
      npx complexity-report -f markdown -o reports/complexity-report-$DATE.md $(cat .complexity-staged-files)
    else
      echo "Aucun fichier JavaScript/TypeScript en staging."
    fi
    rm -f .complexity-staged-files
  elif [ -n "$COMPONENT" ]; then
    npx complexity-report -f markdown -o reports/complexity-report-$DATE.md src/**/$COMPONENT*.{js,jsx,ts,tsx}
  else
    npx complexity-report -f markdown -o reports/complexity-report-$DATE.md src
  fi
  
  echo "Rapport de complexité généré: reports/complexity-report-$DATE.md"
}

# Fonction pour vérifier les dépendances obsolètes
check_outdated_dependencies() {
  echo "🔍 Vérification des dépendances obsolètes..."
  
  npm outdated | tee reports/outdated-dependencies-$DATE.txt
  
  echo "Rapport des dépendances obsolètes généré: reports/outdated-dependencies-$DATE.txt"
}

# Fonction pour vérifier les vulnérabilités
check_vulnerabilities() {
  echo "🔍 Vérification des vulnérabilités..."
  
  npm audit | tee reports/vulnerabilities-$DATE.txt
  
  echo "Rapport des vulnérabilités généré: reports/vulnerabilities-$DATE.txt"
}

# Fonction pour vérifier les performances
check_performance() {
  echo "🔍 Analyse des performances..."
  
  if [ ! -f node_modules/.bin/lighthouse ]; then
    echo "Installation de lighthouse..."
    npm install --save-dev lighthouse
  fi
  
  # Vérifier si l'application est en cours d'exécution
  if curl -s http://localhost:5173 > /dev/null; then
    npx lighthouse http://localhost:5173 --output=json --output=html --output-path=./reports/lighthouse-report-$DATE
    echo "Rapport de performance généré: reports/lighthouse-report-$DATE.html"
  else
    echo "⚠️ L'application n'est pas en cours d'exécution. Lancez-la avec 'npm run dev' pour analyser les performances."
  fi
}

# Fonction pour vérifier l'accessibilité
check_accessibility() {
  echo "🔍 Analyse de l'accessibilité..."
  
  if [ ! -f node_modules/.bin/pa11y ]; then
    echo "Installation de pa11y..."
    npm install --save-dev pa11y
  fi
  
  # Vérifier si l'application est en cours d'exécution
  if curl -s http://localhost:5173 > /dev/null; then
    npx pa11y http://localhost:5173 --reporter html > reports/accessibility-report-$DATE.html
    echo "Rapport d'accessibilité généré: reports/accessibility-report-$DATE.html"
  else
    echo "⚠️ L'application n'est pas en cours d'exécution. Lancez-la avec 'npm run dev' pour analyser l'accessibilité."
  fi
}

# Exécuter toutes les vérifications
echo "🚀 Démarrage de la revue de code..."

run_eslint
run_typescript
run_prettier
run_complexity_analysis
check_outdated_dependencies
check_vulnerabilities

# Ces vérifications nécessitent que l'application soit en cours d'exécution
if curl -s http://localhost:5173 > /dev/null; then
  check_performance
  check_accessibility
else
  echo "⚠️ L'application n'est pas en cours d'exécution. Les analyses de performance et d'accessibilité ne seront pas effectuées."
  echo "Lancez l'application avec 'npm run dev' et exécutez à nouveau ce script pour des analyses complètes."
fi

echo "✅ Revue de code terminée. Consultez les rapports dans le dossier 'reports'."
