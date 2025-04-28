# Documentation des fonctionnalités de Naat

Ce document détaille les principales fonctionnalités de l'application Naat, avec un focus particulier sur les fonctionnalités récemment ajoutées.

## Table des matières

- [Expérience utilisateur](#expérience-utilisateur)
  - [Animations et transitions](#animations-et-transitions)
  - [Accessibilité](#accessibilité)
  - [Thèmes](#thèmes)
- [Services premium](#services-premium)
  - [Système de recommandation](#système-de-recommandation)
  - [Abonnements groupés](#abonnements-groupés)
  - [Programme de fidélité](#programme-de-fidélité)
- [Optimisations de performance](#optimisations-de-performance)
  - [React Query](#react-query)
  - [Chargement paresseux](#chargement-paresseux)
  - [Virtualisation](#virtualisation)
- [Tests](#tests)
  - [Tests unitaires et d'intégration](#tests-unitaires-et-dintégration)
  - [Tests de performance](#tests-de-performance)
  - [CI/CD](#cicd)

## Expérience utilisateur

### Animations et transitions

Naat utilise Framer Motion pour offrir une expérience utilisateur fluide et engageante :

- **Transitions de page** : Animations fluides lors de la navigation entre les pages
- **Animations d'entrée/sortie** : Les éléments apparaissent et disparaissent avec élégance
- **Animations interactives** : Feedback visuel lors des interactions (hover, clic, etc.)
- **Animations séquentielles** : Les éléments s'animent les uns après les autres pour un effet plus naturel

Exemple d'utilisation du composant `PageTransition` :

```tsx
import PageTransition from "@/components/PageTransition";

function MyPage() {
  return (
    <PageTransition>
      <div>Contenu de ma page</div>
    </PageTransition>
  );
}
```

### Accessibilité

L'application est conçue pour être accessible à tous les utilisateurs, y compris ceux utilisant des technologies d'assistance :

- **Navigation au clavier** : Tous les éléments interactifs sont accessibles au clavier
- **Attributs ARIA** : Utilisation appropriée des attributs ARIA pour améliorer la compatibilité avec les lecteurs d'écran
- **Contraste et lisibilité** : Respect des normes WCAG pour le contraste et la lisibilité
- **Skip to content** : Lien permettant aux utilisateurs de clavier de sauter directement au contenu principal

Composants accessibles disponibles :
- `AccessibleServiceCard` : Version accessible des cartes de service
- `AccessibleFormField` : Champs de formulaire avec labels et messages d'erreur accessibles
- `SkipToContent` : Lien pour sauter la navigation et aller directement au contenu principal

### Thèmes

Naat propose un système de thèmes clair/sombre pour s'adapter aux préférences des utilisateurs :

- **Thème clair** : Interface lumineuse pour une utilisation en journée
- **Thème sombre** : Interface sombre pour réduire la fatigue oculaire en conditions de faible luminosité
- **Thème système** : S'adapte automatiquement aux préférences du système d'exploitation
- **Persistance** : Le choix du thème est sauvegardé entre les sessions

Utilisation du hook `useTheme` :

```tsx
import { useTheme } from "@/components/ThemeProvider";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Basculer vers le thème {theme === 'dark' ? 'clair' : 'sombre'}
    </button>
  );
}
```

## Services premium

### Système de recommandation

Naat propose un système de recommandation intelligent pour suggérer des services adaptés aux besoins des utilisateurs :

- **Recommandations basées sur l'historique** : Suggestions basées sur les interactions passées de l'utilisateur
- **Recommandations basées sur les utilisateurs similaires** : Suggestions basées sur les choix d'utilisateurs au profil similaire
- **Recommandations basées sur la popularité** : Suggestions des services les plus populaires
- **Recommandations d'offres groupées** : Suggestions d'offres groupées avantageuses

Le système utilise plusieurs facteurs pour calculer un score de pertinence pour chaque recommandation.

### Abonnements groupés

Les abonnements groupés permettent aux utilisateurs de bénéficier de remises en souscrivant à plusieurs services :

- **Packs thématiques** : Combinaisons de services complémentaires
- **Remises significatives** : Économies par rapport à l'achat séparé des services
- **Facturation unique** : Simplification de la gestion des abonnements
- **Offres personnalisées** : Suggestions d'offres groupées adaptées au profil de l'utilisateur

Exemple d'offre groupée :
- **Pack Premium + Assurance** : Abonnement Premium avec Assurance Tontine à prix réduit
- **Pack Analyse Complète** : Analyse Financière avec Consultation Financière
- **Pack International** : Transfert International avec Analyse Financière

### Programme de fidélité

Le programme de fidélité récompense les utilisateurs fidèles avec des points et des avantages exclusifs :

- **Système de points** : Accumulation de points pour chaque action et paiement
- **Niveaux de fidélité** : Progression à travers différents niveaux (Bronze, Argent, Or, Platine)
- **Récompenses** : Remises, services gratuits, cashback et autres avantages
- **Historique des transactions** : Suivi détaillé des points gagnés et dépensés

Avantages par niveau :
- **Bronze** : Accès aux récompenses de base, 5 points par euro dépensé
- **Argent** : 7 points par euro, accès aux récompenses de niveau Argent
- **Or** : 10 points par euro, accès aux récompenses de niveau Or, support prioritaire
- **Platine** : 15 points par euro, accès aux récompenses exclusives, support VIP 24/7

## Optimisations de performance

### React Query

Naat utilise React Query pour optimiser la gestion des données et les appels API :

- **Mise en cache** : Réduction des appels API redondants
- **Invalidation intelligente** : Mise à jour automatique des données périmées
- **Gestion des états de chargement** : Affichage approprié des états de chargement, d'erreur et de succès
- **Préchargement** : Chargement anticipé des données pour une expérience plus fluide

Hooks personnalisés disponibles :
- `useServiceQuery` : Hook pour les requêtes de service
- `useServiceMutation` : Hook pour les mutations de service
- `prefetchServiceQuery` : Fonction pour précharger les données

### Chargement paresseux

Le chargement paresseux permet de réduire le temps de chargement initial de l'application :

- **Composants chargés à la demande** : Les composants lourds sont chargés uniquement lorsqu'ils sont nécessaires
- **Code splitting** : Division du bundle JavaScript en chunks plus petits
- **Placeholders** : Affichage de placeholders pendant le chargement des composants
- **Priorité au contenu visible** : Chargement prioritaire du contenu visible à l'écran

Utilisation du composant `LazyLoad` :

```tsx
import LazyLoad from "@/components/LazyLoad";
import { createLazyComponent } from "@/components/LazyLoad";

const LazyHeavyComponent = createLazyComponent(() => import("./HeavyComponent"));

function MyComponent() {
  return (
    <LazyLoad
      component={LazyHeavyComponent}
      props={{ /* props for HeavyComponent */ }}
      fallback={<div>Chargement...</div>}
    />
  );
}
```

### Virtualisation

La virtualisation permet d'afficher efficacement de grandes listes de données :

- **Rendu conditionnel** : Seuls les éléments visibles sont rendus dans le DOM
- **Performances optimisées** : Réduction significative de la charge de rendu pour les longues listes
- **Défilement fluide** : Expérience de défilement fluide même avec des milliers d'éléments
- **Chargement à la demande** : Possibilité de charger plus de données en atteignant la fin de la liste

Utilisation du composant `VirtualizedList` :

```tsx
import VirtualizedList from "@/components/VirtualizedList";

function MyList({ items }) {
  return (
    <VirtualizedList
      items={items}
      height={500}
      itemHeight={50}
      renderItem={(item, index) => (
        <div key={index}>{item.name}</div>
      )}
      onEndReached={() => {
        // Charger plus d'éléments
      }}
    />
  );
}
```

## Tests

### Tests unitaires et d'intégration

Naat maintient une suite de tests complète pour assurer la qualité du code :

- **Tests unitaires** : Tests des composants et services individuels
- **Tests d'intégration** : Tests des interactions entre composants
- **Mocks** : Utilisation de mocks pour isoler les composants lors des tests
- **Couverture de code** : Maintenue à plus de 80%

Commandes pour exécuter les tests :
- `npm run test:unit` : Lance les tests unitaires
- `npm run test:integration` : Lance les tests d'intégration
- `npm run test:coverage` : Lance les tests avec rapport de couverture

### Tests de performance

Des tests de performance sont mis en place pour garantir les performances de l'application :

- **Benchmarks** : Mesure des temps d'exécution des opérations critiques
- **Comparaisons** : Comparaison des performances entre différentes approches
- **Seuils** : Définition de seuils de performance à respecter
- **Profilage** : Identification des goulots d'étranglement

Exemple de test de performance pour le composant `VirtualizedList` :

```tsx
it('renders large lists efficiently', () => {
  const items = generateItems(10000);
  
  const renderTime = measurePerformance(() => {
    render(
      <VirtualizedList
        items={items}
        height={500}
        itemHeight={50}
        renderItem={(item) => (
          <div key={item.id}>{item.name}</div>
        )}
      />
    );
  });
  
  // Vérifier que le temps de rendu est raisonnable
  expect(renderTime).toBeLessThan(500);
});
```

### CI/CD

Naat utilise GitHub Actions pour l'intégration continue et le déploiement continu :

- **Exécution automatique des tests** : Les tests sont exécutés automatiquement à chaque push et pull request
- **Vérification du code** : Linting et vérification des types TypeScript
- **Rapports de couverture** : Génération de rapports de couverture de code
- **Déploiement automatique** : Déploiement automatique sur les environnements de test et de production

Configuration CI/CD disponible dans le fichier `.github/workflows/test.yml`.
