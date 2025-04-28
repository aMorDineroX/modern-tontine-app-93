# Guide technique de Naat

Ce document fournit une documentation technique détaillée pour les développeurs travaillant sur l'application Naat.

## Table des matières

- [Architecture](#architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Base de données](#base-de-données)
- [Composants clés](#composants-clés)
  - [Composants UI](#composants-ui)
  - [Contextes](#contextes)
  - [Hooks personnalisés](#hooks-personnalisés)
- [Services](#services)
  - [Service de gestion des services](#service-de-gestion-des-services)
  - [Service de recommandation](#service-de-recommandation)
  - [Service de fidélité](#service-de-fidélité)
  - [Services de paiement](#services-de-paiement)
- [Optimisations](#optimisations)
  - [Stratégies de mise en cache](#stratégies-de-mise-en-cache)
  - [Chargement paresseux](#chargement-paresseux)
  - [Virtualisation](#virtualisation)
- [Tests](#tests)
  - [Configuration des tests](#configuration-des-tests)
  - [Meilleures pratiques](#meilleures-pratiques)
- [Déploiement](#déploiement)
  - [CI/CD](#cicd)
  - [Environnements](#environnements)

## Architecture

### Frontend

L'application Naat utilise une architecture frontend moderne basée sur React et TypeScript :

- **React 18** : Utilisation des dernières fonctionnalités de React, y compris les Hooks et le Concurrent Mode
- **TypeScript** : Typage statique pour améliorer la robustesse du code
- **Vite** : Outil de build rapide pour le développement et la production
- **React Router** : Gestion du routage côté client
- **Framer Motion** : Bibliothèque d'animations pour une expérience utilisateur fluide
- **shadcn/ui** : Composants UI réutilisables et personnalisables
- **Tailwind CSS** : Framework CSS utilitaire pour le styling

L'application suit une architecture modulaire avec séparation des préoccupations :

```
src/
├── components/     # Composants UI réutilisables
├── contexts/       # Contextes React pour l'état global
├── hooks/          # Hooks React personnalisés
├── pages/          # Composants de page
├── services/       # Services pour la logique métier et les appels API
├── styles/         # Styles globaux
├── test/           # Tests
├── types/          # Types TypeScript
└── utils/          # Fonctions utilitaires
```

### Backend

Naat utilise Supabase comme backend-as-a-service :

- **Supabase Auth** : Authentification et gestion des utilisateurs
- **Supabase Database** : Base de données PostgreSQL
- **Supabase Storage** : Stockage de fichiers
- **Supabase Functions** : Fonctions serverless pour la logique métier complexe
- **Row Level Security (RLS)** : Sécurité au niveau des lignes pour contrôler l'accès aux données

### Base de données

La base de données PostgreSQL de Supabase est structurée comme suit :

#### Tables principales

- **users** : Informations sur les utilisateurs (gérée par Supabase Auth)
- **groups** : Groupes de tontine
- **group_members** : Membres des groupes
- **contributions** : Contributions financières
- **payments** : Paiements effectués
- **services** : Services disponibles
- **service_subscriptions** : Abonnements aux services
- **service_features** : Fonctionnalités des services

#### Tables pour les fonctionnalités avancées

- **service_recommendations** : Recommandations de services pour les utilisateurs
- **service_interactions** : Interactions des utilisateurs avec les services
- **service_bundles** : Offres groupées de services
- **service_bundle_items** : Services inclus dans les offres groupées
- **loyalty_accounts** : Comptes de fidélité des utilisateurs
- **loyalty_transactions** : Transactions de points de fidélité
- **loyalty_rewards** : Récompenses disponibles
- **loyalty_reward_claims** : Récompenses réclamées par les utilisateurs
- **promo_codes** : Codes promotionnels

## Composants clés

### Composants UI

#### Composants de base

- **Button** : Bouton personnalisable avec différentes variantes
- **Card** : Carte pour afficher des informations
- **Dialog** : Boîte de dialogue modale
- **Input** : Champ de saisie
- **Select** : Menu déroulant
- **Tabs** : Onglets pour organiser le contenu

#### Composants spécifiques à l'application

- **AnimatedServiceCard** : Carte de service avec animations
- **AnimatedServiceDetails** : Détails d'un service avec animations
- **ServiceRecommendations** : Affichage des recommandations de services
- **ServiceBundles** : Affichage des offres groupées
- **LoyaltyProgram** : Interface du programme de fidélité
- **PaymentMethodSelector** : Sélecteur de méthode de paiement
- **PromoCodeInput** : Champ de saisie pour les codes promotionnels

#### Composants d'accessibilité

- **AccessibleServiceCard** : Version accessible des cartes de service
- **AccessibleFormField** : Champs de formulaire accessibles
- **SkipToContent** : Lien pour sauter la navigation

#### Composants de performance

- **LazyLoad** : Chargement paresseux des composants
- **VirtualizedList** : Liste virtualisée pour les grandes collections de données
- **PageTransition** : Transitions animées entre les pages

### Contextes

- **AppContext** : Configuration globale de l'application
- **AuthContext** : Gestion de l'authentification
- **ChatContext** : Gestion du chat intégré
- **ThemeProvider** : Gestion des thèmes clair/sombre

### Hooks personnalisés

- **useServiceQuery** : Hook pour les requêtes de service avec React Query
- **useServiceMutation** : Hook pour les mutations de service avec React Query
- **useSupabaseQuery** : Hook pour les requêtes Supabase avec React Query
- **useTheme** : Hook pour accéder et modifier le thème
- **useToast** : Hook pour afficher des notifications toast

## Services

### Service de gestion des services

Le service `serviceManagementService` gère les services disponibles et les abonnements :

```typescript
// Principales fonctions
getAllServices(): Promise<ServiceResponse<Service[]>>
getUserServices(userId: string): Promise<ServiceResponse<UserService[]>>
getServiceDetails(serviceId: number): Promise<ServiceResponse<ServiceWithFeatures>>
subscribeToService(userId: string, serviceId: number, paymentMethod: string, paymentId: string): Promise<ServiceResponse<number>>
cancelSubscription(subscriptionId: number): Promise<ServiceResponse<boolean>>
```

### Service de recommandation

Le service `recommendationService` gère les recommandations de services :

```typescript
// Principales fonctions
recordServiceInteraction(userId: string, serviceId: number, interactionType: InteractionType): Promise<ServiceResponse<boolean>>
getUserServiceRecommendations(userId: string, limit?: number): Promise<ServiceResponse<ServiceRecommendation[]>>
getServiceBundles(): Promise<ServiceResponse<any[]>>
```

### Service de fidélité

Le service `loyaltyService` gère le programme de fidélité :

```typescript
// Principales fonctions
getLoyaltyAccount(userId: string): Promise<ServiceResponse<LoyaltyAccount>>
getLoyaltyTransactions(userId: string, limit?: number, offset?: number): Promise<ServiceResponse<LoyaltyTransaction[]>>
getAvailableLoyaltyRewards(userId: string, limit?: number, offset?: number): Promise<ServiceResponse<LoyaltyReward[]>>
claimLoyaltyReward(userId: string, rewardId: number): Promise<ServiceResponse<number>>
```

### Services de paiement

#### PayPal

Le service `paypalService` gère les paiements via PayPal :

```typescript
// Principales fonctions
createPayPalOrder(amount: number, currency: string, description: string): Promise<ServiceResponse<string>>
capturePayPalOrder(orderId: string): Promise<ServiceResponse<any>>
```

#### Stripe

Le service `stripeService` gère les paiements par carte bancaire via Stripe :

```typescript
// Principales fonctions
createPaymentIntent(amount: number, currency: string, description: string): Promise<ServiceResponse<string>>
confirmCardPayment(paymentIntentId: string, paymentMethodId: string): Promise<ServiceResponse<any>>
```

## Optimisations

### Stratégies de mise en cache

Naat utilise React Query pour optimiser la gestion des données :

- **Mise en cache des requêtes** : Les résultats des requêtes sont mis en cache pour éviter des appels API redondants
- **Invalidation intelligente** : Les données sont automatiquement invalidées lorsqu'elles sont modifiées
- **Revalidation en arrière-plan** : Les données sont revalidées en arrière-plan pour maintenir leur fraîcheur
- **Préchargement** : Les données sont préchargées pour améliorer l'expérience utilisateur

Exemple de configuration de React Query :

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});
```

### Chargement paresseux

Le chargement paresseux est implémenté pour les composants lourds :

- **Code splitting** : Division du bundle JavaScript en chunks plus petits
- **Chargement à la demande** : Les composants sont chargés uniquement lorsqu'ils sont nécessaires
- **Suspense** : Utilisation de React.Suspense pour afficher un fallback pendant le chargement

Exemple d'implémentation :

```typescript
// Création d'un composant chargé paresseusement
const LazyHeavyComponent = createLazyComponent(() => import("./HeavyComponent"));

// Utilisation du composant
<LazyLoad
  component={LazyHeavyComponent}
  props={{ /* props */ }}
  fallback={<Skeleton />}
/>
```

### Virtualisation

La virtualisation est utilisée pour optimiser l'affichage des longues listes :

- **Rendu conditionnel** : Seuls les éléments visibles sont rendus dans le DOM
- **Recyclage des éléments** : Les éléments sont réutilisés lors du défilement
- **Chargement à la demande** : Possibilité de charger plus de données en atteignant la fin de la liste

Exemple d'implémentation :

```typescript
<VirtualizedList
  items={items}
  height={500}
  itemHeight={50}
  renderItem={(item, index) => (
    <div key={index}>{item.name}</div>
  )}
  overscan={5}
  onEndReached={() => {
    // Charger plus d'éléments
  }}
  endReachedThreshold={0.8}
/>
```

## Tests

### Configuration des tests

Naat utilise Vitest pour les tests unitaires et d'intégration, et Cypress pour les tests de bout en bout :

- **vitest.unit.config.ts** : Configuration pour les tests unitaires
- **vitest.integration.config.ts** : Configuration pour les tests d'intégration
- **vitest.performance.config.ts** : Configuration pour les tests de performance
- **cypress.config.ts** : Configuration pour les tests de bout en bout

### Meilleures pratiques

- **Tests unitaires** : Tester les composants et services individuellement
- **Tests d'intégration** : Tester les interactions entre composants
- **Tests de bout en bout** : Tester les parcours utilisateur complets
- **Tests de performance** : Mesurer les performances des opérations critiques
- **Mocks** : Utiliser des mocks pour isoler les composants lors des tests
- **Fixtures** : Utiliser des fixtures pour les données de test

Exemple de test unitaire :

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceCard from './ServiceCard';

describe('ServiceCard', () => {
  it('renders service details correctly', () => {
    const mockService = {
      id: 1,
      name: 'Premium',
      description: 'Service premium',
      price: 9.99,
      // ...
    };
    
    render(<ServiceCard service={mockService} />);
    
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Service premium')).toBeInTheDocument();
    expect(screen.getByText('9.99 €')).toBeInTheDocument();
  });
});
```

## Déploiement

### CI/CD

Naat utilise GitHub Actions pour l'intégration continue et le déploiement continu :

- **.github/workflows/test.yml** : Exécution des tests
- **.github/workflows/deploy.yml** : Déploiement de l'application

Le pipeline CI/CD comprend les étapes suivantes :
1. Installation des dépendances
2. Linting et vérification des types
3. Exécution des tests unitaires et d'intégration
4. Exécution des tests de performance
5. Génération des rapports de couverture
6. Build de l'application
7. Exécution des tests de bout en bout
8. Déploiement sur l'environnement approprié

### Environnements

Naat est déployé sur plusieurs environnements :

- **Development** : Environnement de développement pour les tests en cours de développement
- **Staging** : Environnement de préproduction pour les tests avant déploiement en production
- **Production** : Environnement de production pour les utilisateurs finaux

Chaque environnement a sa propre instance Supabase et sa propre configuration.
