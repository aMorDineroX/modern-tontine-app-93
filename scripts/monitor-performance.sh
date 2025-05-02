#!/bin/bash

# Script pour surveiller les performances de l'application
# Utilisation: ./monitor-performance.sh [options]
# Options:
#   --url=<url>: URL à surveiller (par défaut: http://localhost:5173)
#   --runs=<nombre>: Nombre d'exécutions (par défaut: 3)
#   --device=<mobile|desktop>: Type d'appareil à simuler (par défaut: desktop)

# Se placer à la racine du projet
cd "$(dirname "$0")/.."

# Analyser les arguments
URL="http://localhost:5173"
RUNS=3
DEVICE="desktop"

for arg in "$@"; do
  case $arg in
    --url=*)
      URL="${arg#*=}"
      shift
      ;;
    --runs=*)
      RUNS="${arg#*=}"
      shift
      ;;
    --device=*)
      DEVICE="${arg#*=}"
      shift
      ;;
  esac
done

# Vérifier si Lighthouse est installé
if ! command -v lighthouse &> /dev/null; then
    echo "Lighthouse n'est pas installé. Installation en cours..."
    npm install -g lighthouse
fi

# Créer le dossier de rapports s'il n'existe pas
mkdir -p reports/performance

# Date pour les noms de fichiers
DATE=$(date +"%Y%m%d_%H%M%S")

# Fonction pour exécuter Lighthouse
run_lighthouse() {
  echo "🔍 Analyse des performances avec Lighthouse..."
  
  LIGHTHOUSE_OPTIONS="--output=json --output=html --quiet"
  
  if [ "$DEVICE" = "mobile" ]; then
    LIGHTHOUSE_OPTIONS="$LIGHTHOUSE_OPTIONS --emulated-form-factor=mobile"
  else
    LIGHTHOUSE_OPTIONS="$LIGHTHOUSE_OPTIONS --emulated-form-factor=desktop"
  fi
  
  # Exécuter Lighthouse plusieurs fois et calculer la moyenne
  for (( i=1; i<=$RUNS; i++ )); do
    echo "Exécution $i sur $RUNS..."
    
    REPORT_PREFIX="reports/performance/lighthouse-$DEVICE-run$i-$DATE"
    
    lighthouse "$URL" $LIGHTHOUSE_OPTIONS --output-path="$REPORT_PREFIX"
    
    # Extraire les scores
    PERFORMANCE=$(cat "$REPORT_PREFIX.report.json" | jq '.categories.performance.score * 100')
    ACCESSIBILITY=$(cat "$REPORT_PREFIX.report.json" | jq '.categories.accessibility.score * 100')
    BEST_PRACTICES=$(cat "$REPORT_PREFIX.report.json" | jq '.categories["best-practices"].score * 100')
    SEO=$(cat "$REPORT_PREFIX.report.json" | jq '.categories.seo.score * 100')
    
    echo "Performance: $PERFORMANCE"
    echo "Accessibilité: $ACCESSIBILITY"
    echo "Bonnes pratiques: $BEST_PRACTICES"
    echo "SEO: $SEO"
    echo ""
    
    # Ajouter les scores au fichier CSV
    if [ $i -eq 1 ]; then
      echo "Run,Performance,Accessibility,Best Practices,SEO" > "reports/performance/scores-$DEVICE-$DATE.csv"
    fi
    
    echo "$i,$PERFORMANCE,$ACCESSIBILITY,$BEST_PRACTICES,$SEO" >> "reports/performance/scores-$DEVICE-$DATE.csv"
  done
  
  # Calculer les moyennes
  PERFORMANCE_AVG=$(awk -F, 'NR>1 {sum+=$2} END {print sum/(NR-1)}' "reports/performance/scores-$DEVICE-$DATE.csv")
  ACCESSIBILITY_AVG=$(awk -F, 'NR>1 {sum+=$3} END {print sum/(NR-1)}' "reports/performance/scores-$DEVICE-$DATE.csv")
  BEST_PRACTICES_AVG=$(awk -F, 'NR>1 {sum+=$4} END {print sum/(NR-1)}' "reports/performance/scores-$DEVICE-$DATE.csv")
  SEO_AVG=$(awk -F, 'NR>1 {sum+=$5} END {print sum/(NR-1)}' "reports/performance/scores-$DEVICE-$DATE.csv")
  
  echo "Moyennes sur $RUNS exécutions:"
  echo "Performance: $PERFORMANCE_AVG"
  echo "Accessibilité: $ACCESSIBILITY_AVG"
  echo "Bonnes pratiques: $BEST_PRACTICES_AVG"
  echo "SEO: $SEO_AVG"
  
  # Ajouter les moyennes au fichier CSV
  echo "Average,$PERFORMANCE_AVG,$ACCESSIBILITY_AVG,$BEST_PRACTICES_AVG,$SEO_AVG" >> "reports/performance/scores-$DEVICE-$DATE.csv"
  
  echo "Rapports générés dans le dossier reports/performance"
}

# Fonction pour exécuter WebPageTest
run_webpagetest() {
  echo "🔍 Analyse des performances avec WebPageTest..."
  
  if ! command -v webpagetest &> /dev/null; then
    echo "WebPageTest CLI n'est pas installé. Installation en cours..."
    npm install -g webpagetest
  fi
  
  # Vérifier si la clé API est définie
  if [ -z "$WPT_API_KEY" ]; then
    echo "⚠️ La clé API WebPageTest n'est pas définie. Veuillez définir la variable d'environnement WPT_API_KEY."
    return
  fi
  
  DEVICE_PARAM=""
  if [ "$DEVICE" = "mobile" ]; then
    DEVICE_PARAM="--mobile"
  fi
  
  webpagetest test "$URL" --key "$WPT_API_KEY" $DEVICE_PARAM --location "ec2-us-east-1:Chrome" --runs "$RUNS" --first --timeline --netlog --lighthouse --video --save "reports/performance/webpagetest-$DEVICE-$DATE.json"
  
  echo "Rapport WebPageTest généré: reports/performance/webpagetest-$DEVICE-$DATE.json"
}

# Fonction pour exécuter React Profiler
run_react_profiler() {
  echo "🔍 Analyse des performances avec React Profiler..."
  
  echo "Pour utiliser React Profiler:"
  echo "1. Ouvrez l'application dans Chrome"
  echo "2. Ouvrez les outils de développement (F12)"
  echo "3. Allez dans l'onglet 'Profiler'"
  echo "4. Cliquez sur 'Start profiling and reload page'"
  echo "5. Interagissez avec l'application"
  echo "6. Cliquez sur 'Stop'"
  echo "7. Analysez les résultats"
  echo "8. Exportez les résultats en cliquant sur 'Save profile...'"
  
  echo "Vous pouvez également utiliser React DevTools Profiler pour une analyse plus détaillée."
}

# Vérifier si l'application est en cours d'exécution
if ! curl -s "$URL" > /dev/null; then
  echo "⚠️ L'application n'est pas accessible à l'URL $URL."
  echo "Veuillez démarrer l'application avec 'npm run dev' et réessayer."
  exit 1
fi

# Exécuter les analyses
echo "🚀 Démarrage de l'analyse des performances..."
echo "URL: $URL"
echo "Appareil: $DEVICE"
echo "Nombre d'exécutions: $RUNS"
echo ""

run_lighthouse
# run_webpagetest  # Nécessite une clé API
run_react_profiler

echo "✅ Analyse des performances terminée. Consultez les rapports dans le dossier 'reports/performance'."
