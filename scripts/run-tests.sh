#!/bin/bash

# Script pour exécuter les tests et générer un rapport de couverture
# Utilisation: ./run-tests.sh [options]
# Options:
#   --ci: Exécuter en mode CI (sans interface utilisateur)
#   --watch: Exécuter en mode watch
#   --component=<nom>: Tester un composant spécifique

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Analyser les arguments
CI_MODE=false
WATCH_MODE=false
COMPONENT=""

for arg in "$@"; do
  case $arg in
    --ci)
      CI_MODE=true
      shift
      ;;
    --watch)
      WATCH_MODE=true
      shift
      ;;
    --component=*)
      COMPONENT="${arg#*=}"
      shift
      ;;
  esac
done

# Vérifier si Vitest est installé
if ! grep -q "vitest" package.json; then
    echo "Vitest n'est pas installé. Installation en cours..."
    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
fi

# Créer le dossier de rapports s'il n'existe pas
mkdir -p reports

# Définir les options de test
TEST_OPTIONS=""

if [ "$CI_MODE" = true ]; then
    TEST_OPTIONS="$TEST_OPTIONS --run"
fi

if [ "$WATCH_MODE" = true ]; then
    TEST_OPTIONS="$TEST_OPTIONS --watch"
else
    TEST_OPTIONS="$TEST_OPTIONS --run"
fi

if [ -n "$COMPONENT" ]; then
    TEST_OPTIONS="$TEST_OPTIONS --testNamePattern=$COMPONENT"
    echo "Exécution des tests pour le composant: $COMPONENT"
else
    echo "Exécution de tous les tests..."
fi

# Exécuter les tests
if [ "$CI_MODE" = true ]; then
    echo "Mode CI: exécution des tests sans interface utilisateur..."
    npm test -- $TEST_OPTIONS
else
    npm test -- $TEST_OPTIONS
fi

# Vérifier si les tests ont réussi
if [ $? -ne 0 ]; then
    echo "❌ Certains tests ont échoué. Veuillez corriger les erreurs avant de continuer."
    exit 1
fi

# Exécuter les tests avec couverture de code si nous ne sommes pas en mode watch
if [ "$WATCH_MODE" = false ]; then
    echo "Génération du rapport de couverture de code..."

    if [ -n "$COMPONENT" ]; then
        npm test -- --coverage --testNamePattern=$COMPONENT
    else
        npm test -- --coverage
    fi

    # Vérifier le taux de couverture
    COVERAGE_THRESHOLD=80
    COVERAGE=$(grep -A 4 "All files" coverage/coverage-summary.json | grep "statements" | awk -F: '{print $2}' | awk -F, '{print $1}' | tr -d ' ')

    echo "Taux de couverture global: $COVERAGE%"

    if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
        echo "⚠️ Attention: Le taux de couverture est inférieur à $COVERAGE_THRESHOLD%"
    else
        echo "✅ Le taux de couverture est supérieur à $COVERAGE_THRESHOLD%"
    fi

    # Copier le rapport dans le dossier reports
    cp -r coverage reports/coverage-$(date +"%Y%m%d_%H%M%S")
    echo "Rapport de couverture sauvegardé dans le dossier reports"
fi

echo "Tests terminés."
