#!/bin/bash

# Script pour vérifier l'accessibilité de l'application
# Utilisation: ./check-accessibility.sh [options]
# Options:
#   --url=<url>: URL à vérifier (par défaut: http://localhost:5173)
#   --standard=<wcag2a|wcag2aa|wcag2aaa>: Standard WCAG à utiliser (par défaut: wcag2aa)
#   --path=<chemin>: Chemin spécifique à vérifier (par défaut: /)

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Analyser les arguments
BASE_URL="http://localhost:5173"
STANDARD="wcag2aa"
PATH_TO_CHECK="/"

for arg in "$@"; do
  case $arg in
    --url=*)
      BASE_URL="${arg#*=}"
      shift
      ;;
    --standard=*)
      STANDARD="${arg#*=}"
      shift
      ;;
    --path=*)
      PATH_TO_CHECK="${arg#*=}"
      shift
      ;;
  esac
done

# URL complète
URL="${BASE_URL}${PATH_TO_CHECK}"

# Vérifier si Pa11y est installé
if ! command -v pa11y &> /dev/null; then
    echo "Pa11y n'est pas installé. Installation en cours..."
    npm install -g pa11y
fi

# Créer le dossier de rapports s'il n'existe pas
mkdir -p reports/accessibility

# Date pour les noms de fichiers
DATE=$(date +"%Y%m%d_%H%M%S")

# Fonction pour exécuter Pa11y
run_pa11y() {
  echo "🔍 Vérification de l'accessibilité avec Pa11y..."
  
  PA11Y_OPTIONS="--standard $STANDARD --reporter html"
  
  # Exécuter Pa11y
  pa11y $PA11Y_OPTIONS "$URL" > "reports/accessibility/pa11y-$DATE.html"
  
  # Exécuter Pa11y avec le format JSON pour l'analyse
  pa11y --standard $STANDARD --reporter json "$URL" > "reports/accessibility/pa11y-$DATE.json"
  
  # Analyser les résultats
  ISSUES_COUNT=$(cat "reports/accessibility/pa11y-$DATE.json" | jq '. | length')
  ERROR_COUNT=$(cat "reports/accessibility/pa11y-$DATE.json" | jq '[.[] | select(.type == "error")] | length')
  WARNING_COUNT=$(cat "reports/accessibility/pa11y-$DATE.json" | jq '[.[] | select(.type == "warning")] | length')
  NOTICE_COUNT=$(cat "reports/accessibility/pa11y-$DATE.json" | jq '[.[] | select(.type == "notice")] | length')
  
  echo "Résultats de l'analyse d'accessibilité:"
  echo "Total des problèmes: $ISSUES_COUNT"
  echo "Erreurs: $ERROR_COUNT"
  echo "Avertissements: $WARNING_COUNT"
  echo "Notices: $NOTICE_COUNT"
  
  # Créer un rapport de synthèse
  echo "# Rapport d'accessibilité - $(date)" > "reports/accessibility/summary-$DATE.md"
  echo "" >> "reports/accessibility/summary-$DATE.md"
  echo "## Informations" >> "reports/accessibility/summary-$DATE.md"
  echo "- URL: $URL" >> "reports/accessibility/summary-$DATE.md"
  echo "- Standard: $STANDARD" >> "reports/accessibility/summary-$DATE.md"
  echo "- Date: $(date)" >> "reports/accessibility/summary-$DATE.md"
  echo "" >> "reports/accessibility/summary-$DATE.md"
  echo "## Résultats" >> "reports/accessibility/summary-$DATE.md"
  echo "- Total des problèmes: $ISSUES_COUNT" >> "reports/accessibility/summary-$DATE.md"
  echo "- Erreurs: $ERROR_COUNT" >> "reports/accessibility/summary-$DATE.md"
  echo "- Avertissements: $WARNING_COUNT" >> "reports/accessibility/summary-$DATE.md"
  echo "- Notices: $NOTICE_COUNT" >> "reports/accessibility/summary-$DATE.md"
  echo "" >> "reports/accessibility/summary-$DATE.md"
  
  # Ajouter les erreurs au rapport
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "## Erreurs" >> "reports/accessibility/summary-$DATE.md"
    echo "" >> "reports/accessibility/summary-$DATE.md"
    
    cat "reports/accessibility/pa11y-$DATE.json" | jq -r '.[] | select(.type == "error") | "### " + .context + "\n\n**Code:** " + .code + "\n\n**Message:** " + .message + "\n\n**Sélecteur:** `" + .selector + "`\n\n---\n"' >> "reports/accessibility/summary-$DATE.md"
  fi
  
  echo "Rapports générés:"
  echo "- HTML: reports/accessibility/pa11y-$DATE.html"
  echo "- JSON: reports/accessibility/pa11y-$DATE.json"
  echo "- Synthèse: reports/accessibility/summary-$DATE.md"
}

# Fonction pour exécuter Axe
run_axe() {
  echo "🔍 Vérification de l'accessibilité avec Axe..."
  
  if ! command -v axe &> /dev/null; then
    echo "Axe CLI n'est pas installé. Installation en cours..."
    npm install -g @axe-core/cli
  fi
  
  # Exécuter Axe
  axe "$URL" --save "reports/accessibility/axe-$DATE.json"
  
  echo "Rapport Axe généré: reports/accessibility/axe-$DATE.json"
}

# Vérifier si l'application est en cours d'exécution
if ! curl -s "$URL" > /dev/null; then
  echo "⚠️ L'application n'est pas accessible à l'URL $URL."
  echo "Veuillez démarrer l'application avec 'npm run dev' et réessayer."
  exit 1
fi

# Exécuter les vérifications
echo "🚀 Démarrage de la vérification d'accessibilité..."
echo "URL: $URL"
echo "Standard: $STANDARD"
echo ""

run_pa11y
# run_axe  # Nécessite une installation supplémentaire

echo "✅ Vérification d'accessibilité terminée. Consultez les rapports dans le dossier 'reports/accessibility'."
