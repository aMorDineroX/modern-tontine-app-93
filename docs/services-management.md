# Gestion des Services dans Naat

Ce document décrit l'implémentation et l'utilisation du système de gestion des services dans l'application Naat.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure de la base de données](#structure-de-la-base-de-données)
3. [Services disponibles](#services-disponibles)
4. [API de gestion des services](#api-de-gestion-des-services)
5. [Composants d'interface utilisateur](#composants-dinterface-utilisateur)
6. [Intégration avec PayPal](#intégration-avec-paypal)
7. [Exemples d'utilisation](#exemples-dutilisation)
8. [Tests](#tests)

## Vue d'ensemble

Le système de gestion des services permet aux utilisateurs de s'abonner à différents services premium proposés par Naat. Ces services offrent des fonctionnalités supplémentaires pour améliorer l'expérience utilisateur et la gestion des tontines.

Le système comprend :
- Une base de données pour stocker les services, les abonnements et les transactions
- Une API pour gérer les services et les abonnements
- Des composants d'interface utilisateur pour afficher et interagir avec les services
- Une intégration avec PayPal pour les paiements

## Structure de la base de données

Le système utilise quatre tables principales dans Supabase :

### Table `services`

Stocke les informations sur les services disponibles.

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | Identifiant unique du service |
| name | VARCHAR | Nom du service |
| description | TEXT | Description du service |
| icon | VARCHAR | Icône du service (nom de l'icône Lucide) |
| price | DECIMAL | Prix du service |
| currency | VARCHAR | Devise du prix (EUR, USD, etc.) |
| is_recurring | BOOLEAN | Indique si le service est récurrent |
| recurring_interval | VARCHAR | Intervalle de récurrence (day, week, month, year) |
| is_active | BOOLEAN | Indique si le service est actif |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de dernière mise à jour |

### Table `service_features`

Stocke les fonctionnalités de chaque service.

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | Identifiant unique de la fonctionnalité |
| service_id | INTEGER | Identifiant du service associé |
| name | VARCHAR | Nom de la fonctionnalité |
| description | TEXT | Description de la fonctionnalité |
| is_highlighted | BOOLEAN | Indique si la fonctionnalité est mise en avant |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de dernière mise à jour |

### Table `service_subscriptions`

Stocke les abonnements des utilisateurs aux services.

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | Identifiant unique de l'abonnement |
| user_id | UUID | Identifiant de l'utilisateur |
| service_id | INTEGER | Identifiant du service |
| status | VARCHAR | Statut de l'abonnement (active, cancelled, expired, pending) |
| start_date | TIMESTAMP | Date de début de l'abonnement |
| end_date | TIMESTAMP | Date de fin de l'abonnement (si applicable) |
| last_payment_date | TIMESTAMP | Date du dernier paiement |
| next_payment_date | TIMESTAMP | Date du prochain paiement (si récurrent) |
| payment_method | VARCHAR | Méthode de paiement (paypal, credit_card, bank_transfer) |
| payment_reference | VARCHAR | Référence du paiement |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de dernière mise à jour |

### Table `service_transactions`

Stocke les transactions liées aux services.

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | Identifiant unique de la transaction |
| user_id | UUID | Identifiant de l'utilisateur |
| service_id | INTEGER | Identifiant du service |
| subscription_id | INTEGER | Identifiant de l'abonnement (si applicable) |
| amount | DECIMAL | Montant de la transaction |
| currency | VARCHAR | Devise de la transaction |
| status | VARCHAR | Statut de la transaction (completed, pending, failed, refunded) |
| payment_method | VARCHAR | Méthode de paiement |
| payment_reference | VARCHAR | Référence du paiement |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de dernière mise à jour |

## Services disponibles

Naat propose actuellement les services suivants :

1. **Premium** - Accès à toutes les fonctionnalités premium de Naat
   - Prix : 9,99 € / mois
   - Fonctionnalités : Groupes illimités, pas de publicités, support prioritaire, statistiques avancées, exportation des données

2. **Assurance Tontine** - Protection contre les défauts de paiement des membres
   - Prix : 4,99 € / mois
   - Fonctionnalités : Garantie de paiement, vérification des membres, alertes de risque, rapport mensuel

3. **Analyse Financière** - Rapports détaillés sur vos finances et économies
   - Prix : 2,99 € / mois
   - Fonctionnalités : Tableau de bord personnalisé, prévisions d'épargne, comparaison avec d'autres utilisateurs, recommandations personnalisées

4. **Transfert International** - Envoi d'argent à l'international sans frais
   - Prix : 1,99 € (paiement unique)
   - Fonctionnalités : Sans frais cachés, rapide et sécurisé, disponible dans 150+ pays, taux de change avantageux

5. **Consultation Financière** - Session de 30 minutes avec un conseiller financier
   - Prix : 29,99 € (paiement unique)
   - Fonctionnalités : Conseiller expert, plan financier personnalisé, suivi post-consultation, disponible en plusieurs langues

## API de gestion des services

L'API de gestion des services est implémentée dans le fichier `src/services/serviceManagementService.ts` et expose les fonctions suivantes :

### `getAllServices()`

Récupère tous les services disponibles.

```typescript
const { success, data, error } = await getAllServices();
```

### `getServiceById(serviceId: number)`

Récupère un service par son ID, avec ses fonctionnalités.

```typescript
const { success, data, error } = await getServiceById(1);
```

### `getUserServices(userId: string)`

Récupère les services d'un utilisateur, avec leur statut d'abonnement.

```typescript
const { success, data, error } = await getUserServices('user-123');
```

### `subscribeToService(userId: string, serviceId: number, paymentMethod: string, paymentReference: string)`

Abonne un utilisateur à un service.

```typescript
const { success, data, error } = await subscribeToService('user-123', 1, 'paypal', 'tx_123456');
```

### `cancelServiceSubscription(userId: string, subscriptionId: number)`

Annule un abonnement à un service.

```typescript
const { success, data, error } = await cancelServiceSubscription('user-123', 456);
```

### `getUserServiceTransactions(userId: string)`

Récupère les transactions de service d'un utilisateur.

```typescript
const { success, data, error } = await getUserServiceTransactions('user-123');
```

### `getUserActiveSubscriptions(userId: string)`

Récupère les abonnements actifs d'un utilisateur.

```typescript
const { success, data, error } = await getUserActiveSubscriptions('user-123');
```

### `isUserSubscribedToService(userId: string, serviceId: number)`

Vérifie si un utilisateur est abonné à un service.

```typescript
const { success, data, error } = await isUserSubscribedToService('user-123', 1);
```

## Composants d'interface utilisateur

Le système de gestion des services utilise les composants suivants :

### `ServiceCard`

Affiche un service sous forme de carte.

```tsx
<ServiceCard
  service={service}
  isSubscribed={isSubscribed}
  onSubscribe={handleSubscribe}
  onViewDetails={handleViewDetails}
  showFeatures={true}
/>
```

### `ServiceDetails`

Affiche les détails d'un service.

```tsx
<ServiceDetails
  service={service}
  isSubscribed={isSubscribed}
  onBack={handleBack}
  onSubscriptionChange={handleSubscriptionChange}
/>
```

### `ServicesList`

Affiche une liste de services.

```tsx
<ServicesList
  limit={3}
  showSubscribedOnly={false}
  onServiceClick={handleServiceClick}
/>
```

### `UserSubscriptions`

Affiche les abonnements d'un utilisateur.

```tsx
<UserSubscriptions
  limit={5}
  showManageButton={true}
  onManageClick={handleManageClick}
/>
```

## Intégration avec PayPal

Le système de gestion des services est intégré avec PayPal pour les paiements. L'intégration utilise les composants suivants :

### `PayPalButton`

Affiche un bouton PayPal pour effectuer un paiement.

```tsx
<PayPalButton
  amount={9.99}
  currency="EUR"
  description="Abonnement Premium"
  onSuccess={handlePaymentSuccess}
  onCancel={handlePaymentCancel}
  onError={handlePaymentError}
  isRecurring={true}
  recurringFrequency="month"
  recurringCycles={0}
/>
```

### `PayPalCheckoutButton`

Affiche un bouton qui ouvre une boîte de dialogue avec un bouton PayPal.

```tsx
<PayPalCheckoutButton
  amount={9.99}
  description="Abonnement Premium"
  onSuccess={handlePaymentSuccess}
  buttonText="S'abonner avec PayPal"
  buttonVariant="default"
/>
```

## Exemples d'utilisation

### S'abonner à un service

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { subscribeToService } from "@/services";

const { user } = useAuth();
const { toast } = useToast();

const handleSubscribe = async (serviceId: number, paymentDetails: any) => {
  if (!user) {
    toast({
      title: "Erreur",
      description: "Vous devez être connecté pour vous abonner",
      variant: "destructive",
    });
    return;
  }

  try {
    const { success, error } = await subscribeToService(
      user.id,
      serviceId,
      'paypal',
      paymentDetails.id
    );

    if (!success) {
      throw error;
    }

    toast({
      title: "Abonnement réussi",
      description: "Vous êtes maintenant abonné à ce service",
    });
  } catch (error) {
    console.error("Erreur lors de l'abonnement:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'abonnement",
      variant: "destructive",
    });
  }
};
```

### Annuler un abonnement

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cancelServiceSubscription } from "@/services";

const { user } = useAuth();
const { toast } = useToast();

const handleCancelSubscription = async (subscriptionId: number) => {
  if (!user) {
    toast({
      title: "Erreur",
      description: "Vous devez être connecté pour annuler un abonnement",
      variant: "destructive",
    });
    return;
  }

  try {
    const { success, error } = await cancelServiceSubscription(
      user.id,
      subscriptionId
    );

    if (!success) {
      throw error;
    }

    toast({
      title: "Abonnement annulé",
      description: "Votre abonnement a été annulé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'annulation",
      variant: "destructive",
    });
  }
};
```

## Tests

Le système de gestion des services est testé avec Vitest. Les tests se trouvent dans le fichier `src/services/serviceManagementService.test.ts` et couvrent les fonctionnalités suivantes :

- Récupération de tous les services
- Récupération d'un service par son ID
- Récupération des services d'un utilisateur
- Abonnement à un service
- Annulation d'un abonnement
- Vérification si un utilisateur est abonné à un service

Pour exécuter les tests :

```bash
npm run test
```

Pour exécuter les tests avec la couverture de code :

```bash
npm run test:coverage
```
