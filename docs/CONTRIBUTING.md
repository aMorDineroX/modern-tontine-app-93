# Guide de contribution à Naat

Merci de votre intérêt pour contribuer à Naat ! Ce document fournit des directives pour contribuer efficacement au projet.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
  - [Signaler des bugs](#signaler-des-bugs)
  - [Suggérer des améliorations](#suggérer-des-améliorations)
  - [Contribuer au code](#contribuer-au-code)
- [Standards de code](#standards-de-code)
  - [Style de code](#style-de-code)
  - [Documentation](#documentation)
  - [Tests](#tests)
  - [Accessibilité](#accessibilité)
  - [Performance](#performance)
- [Processus de développement](#processus-de-développement)
  - [Branches](#branches)
  - [Commits](#commits)
  - [Pull Requests](#pull-requests)
  - [Revue de code](#revue-de-code)
- [Structure du projet](#structure-du-projet)

## Code de conduite

En participant à ce projet, vous vous engagez à maintenir un environnement respectueux et inclusif. Nous attendons de tous les contributeurs qu'ils fassent preuve de respect envers les autres participants, indépendamment de leur origine, identité ou niveau d'expérience.

## Comment contribuer

### Signaler des bugs

Si vous trouvez un bug, veuillez [ouvrir une issue](https://github.com/aMorDineroX/modern-tontine-app-93/issues/new) en incluant :

- Une description claire du problème
- Les étapes pour reproduire le bug
- L'environnement dans lequel vous l'avez rencontré (navigateur, OS, etc.)
- Si possible, des captures d'écran ou des logs d'erreur
- Une suggestion de solution si vous en avez une

### Suggérer des améliorations

Pour suggérer une amélioration, veuillez [ouvrir une issue](https://github.com/aMorDineroX/modern-tontine-app-93/issues/new) en incluant :

- Une description claire de l'amélioration proposée
- Les avantages qu'elle apporterait
- Des exemples d'implémentation si possible
- Des maquettes ou wireframes si pertinent

### Contribuer au code

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Standards de code

### Style de code

Nous utilisons ESLint et Prettier pour maintenir un style de code cohérent. Veuillez vous assurer que votre code respecte ces standards :

- Utilisez TypeScript pour tout nouveau code
- Suivez les conventions de nommage existantes :
  - PascalCase pour les composants React
  - camelCase pour les variables, fonctions et instances
  - UPPER_CASE pour les constantes
- Utilisez des noms descriptifs et évitez les abréviations obscures
- Limitez la longueur des lignes à 100 caractères
- Utilisez des espaces (2 espaces) pour l'indentation

Pour vérifier votre code :

```sh
npm run lint
npm run typecheck
```

### Documentation

Une bonne documentation est essentielle pour maintenir le projet accessible à tous les contributeurs :

- Ajoutez des commentaires JSDoc pour les fonctions, classes et interfaces
- Documentez les props des composants React
- Expliquez les décisions de conception complexes
- Mettez à jour la documentation existante lorsque vous modifiez le code

Exemple de documentation JSDoc :

```tsx
/**
 * Composant pour afficher une carte de service avec animations
 * 
 * @component
 * @param {ServiceCardProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServiceCard
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isSubscribed, 
  onSubscribe 
}) => {
  // ...
};
```

### Tests

Tous les nouveaux code doit être accompagné de tests appropriés :

- **Tests unitaires** pour les composants et services individuels
- **Tests d'intégration** pour les interactions entre composants
- **Tests de performance** pour les fonctionnalités critiques en termes de performance

Pour exécuter les tests :

```sh
npm run test:unit        # Tests unitaires
npm run test:integration # Tests d'intégration
npm run test:performance # Tests de performance
npm run test:coverage    # Rapport de couverture
```

Nous visons une couverture de code d'au moins 80%.

### Accessibilité

L'accessibilité est une priorité pour Naat. Tout nouveau code doit respecter les normes WCAG 2.1 AA :

- Utilisez des éléments sémantiques appropriés
- Ajoutez des attributs ARIA lorsque nécessaire
- Assurez-vous que tous les éléments interactifs sont accessibles au clavier
- Maintenez un ratio de contraste suffisant pour le texte
- Testez avec un lecteur d'écran

### Performance

La performance est cruciale pour offrir une bonne expérience utilisateur :

- Utilisez React Query pour la gestion des données
- Implémentez le chargement paresseux pour les composants lourds
- Utilisez la virtualisation pour les longues listes
- Optimisez les rendus avec React.memo, useMemo et useCallback
- Minimisez les re-rendus inutiles

## Processus de développement

### Branches

- `main` : Branche principale, contient le code de production
- `develop` : Branche de développement, contient les fonctionnalités en cours de développement
- `feature/*` : Branches pour les nouvelles fonctionnalités
- `bugfix/*` : Branches pour les corrections de bugs
- `hotfix/*` : Branches pour les corrections urgentes en production

### Commits

Suivez le format de commit conventionnel pour des messages de commit clairs et cohérents :

```
type(scope): description concise

Corps du commit plus détaillé si nécessaire
```

Types de commit :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Modifications de la documentation
- `style` : Modifications de style (formatage, espaces, etc.)
- `refactor` : Refactoring du code
- `perf` : Améliorations de performance
- `test` : Ajout ou modification de tests
- `chore` : Modifications de la configuration, des dépendances, etc.

### Pull Requests

- Créez des Pull Requests ciblées et de taille raisonnable
- Incluez une description claire de ce que fait la PR
- Référencez les issues pertinentes
- Assurez-vous que tous les tests passent
- Demandez une revue à au moins un membre de l'équipe

### Revue de code

- Soyez respectueux et constructif dans vos commentaires
- Concentrez-vous sur le code, pas sur la personne
- Expliquez pourquoi quelque chose devrait être changé
- Suggérez des alternatives lorsque vous identifiez un problème

## Structure du projet

```
naat/
├── .github/            # Configuration GitHub Actions
├── cypress/            # Tests de bout en bout
├── docs/               # Documentation
├── public/             # Fichiers statiques
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── contexts/       # Contextes React pour l'état global
│   ├── hooks/          # Hooks React personnalisés
│   ├── pages/          # Composants de page
│   ├── services/       # Services pour la logique métier et les appels API
│   ├── styles/         # Styles globaux
│   ├── test/           # Tests unitaires et d'intégration
│   ├── types/          # Types TypeScript
│   └── utils/          # Fonctions utilitaires
├── supabase/           # Configuration et migrations Supabase
└── ...                 # Fichiers de configuration racine
```

Merci de contribuer à Naat ! Votre aide est précieuse pour améliorer l'application et offrir une meilleure expérience à nos utilisateurs.
