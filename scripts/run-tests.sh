#!/bin/bash

# Script pour exécuter les tests

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Vérifier si Vitest est installé
if ! grep -q "vitest" package.json; then
    echo "Vitest n'est pas installé. Installation en cours..."
    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
fi

# Exécuter tous les tests
echo "Exécution de tous les tests..."
npm test

# Exécuter les tests avec couverture de code
echo "Exécution des tests avec couverture de code..."
npm test -- --coverage

echo "Tests terminés."
