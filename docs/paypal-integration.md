# Intégration PayPal dans Naat

Ce document explique comment l'intégration PayPal a été mise en œuvre dans l'application Naat et comment l'utiliser.

## Fonctionnalités PayPal

L'intégration PayPal dans Naat offre les fonctionnalités suivantes :

1. **Paiements uniques** - Permettre aux utilisateurs d'effectuer des dépôts ponctuels sur leur compte Naat
2. **Paiements récurrents** - Permettre aux utilisateurs de configurer des contributions automatiques
3. **Historique des transactions** - Afficher l'historique complet des transactions PayPal
4. **Remboursements** - Permettre aux administrateurs de rembourser des paiements
5. **Checkout Express** - Simplifier le processus de paiement avec PayPal Express Checkout

## Architecture

L'intégration PayPal est composée des éléments suivants :

### Composants React

- `PayPalButton.tsx` - Composant principal pour intégrer le bouton PayPal
- `PayPalRecurringPayment.tsx` - Composant pour configurer des paiements récurrents
- `PayPalTransactionHistory.tsx` - Composant pour afficher l'historique des transactions
- `PayPalCheckoutButton.tsx` - Composant pour le checkout express

### Services

- `paypalService.ts` - Service pour gérer les transactions PayPal

### Base de données

- Table `paypal_transactions` - Stocke toutes les transactions PayPal

## Configuration

### Prérequis

Pour utiliser l'intégration PayPal, vous devez disposer des éléments suivants :

1. Un compte PayPal Business
2. Des identifiants d'API PayPal (Client ID et Secret)

### Variables d'environnement

Ajoutez les variables d'environnement suivantes à votre fichier `.env` :

```
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_client_secret
PAYPAL_PLAN_ID=votre_plan_id_pour_abonnements (optionnel)
```

### Migration de la base de données

Exécutez le script SQL de migration pour créer la table `paypal_transactions` :

```bash
psql -U votre_utilisateur -d votre_base_de_donnees -f migrations/paypal_transactions.sql
```

## Utilisation

### Paiements uniques

Pour intégrer un bouton de paiement PayPal unique :

```jsx
import PayPalButton from "@/components/PayPalButton";

<PayPalButton
  amount={50}
  currency="EUR"
  description="Paiement pour Naat"
  onSuccess={(details) => {
    console.log("Paiement réussi", details);
  }}
/>
```

### Paiements récurrents

Pour intégrer un formulaire de paiement récurrent :

```jsx
import PayPalRecurringPayment from "@/components/PayPalRecurringPayment";

<PayPalRecurringPayment
  defaultAmount={25}
  groupName="Mon groupe"
  onSuccess={(details) => {
    console.log("Abonnement créé", details);
  }}
/>
```

### Historique des transactions

Pour afficher l'historique des transactions :

```jsx
import PayPalTransactionHistory from "@/components/PayPalTransactionHistory";

<PayPalTransactionHistory
  limit={5}
  showRefundOption={true}
  onRefund={(transaction) => {
    console.log("Remboursement demandé pour", transaction);
  }}
/>
```

### Checkout Express

Pour intégrer un bouton de checkout express :

```jsx
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton";

<PayPalCheckoutButton
  amount={10}
  description="Dépôt rapide"
  buttonText="Payer maintenant"
  onSuccess={(details) => {
    console.log("Paiement réussi", details);
  }}
/>
```

## Gestion des transactions

### Enregistrement des transactions

Toutes les transactions PayPal sont automatiquement enregistrées dans la table `paypal_transactions` de la base de données.

### Remboursements

Pour effectuer un remboursement :

```javascript
import { savePayPalRefund } from "@/services/paypalService";

// Rembourser une transaction
const handleRefund = async (transactionId) => {
  const { success, data } = await savePayPalRefund(
    userId,
    transactionId,
    "refund_" + Date.now(),
    amount,
    currency,
    "Remboursement demandé par l'utilisateur"
  );
  
  if (success) {
    console.log("Remboursement effectué", data);
  }
};
```

## Sécurité

L'intégration PayPal utilise les meilleures pratiques de sécurité :

1. **HTTPS** - Toutes les communications avec PayPal sont effectuées via HTTPS
2. **Validation côté serveur** - Les transactions sont validées côté serveur
3. **Row Level Security** - Les utilisateurs ne peuvent voir que leurs propres transactions

## Dépannage

### Problèmes courants

1. **Le bouton PayPal ne s'affiche pas**
   - Vérifiez que le Client ID PayPal est correct
   - Assurez-vous que JavaScript est activé dans le navigateur

2. **Erreur lors du paiement**
   - Vérifiez les logs côté client et serveur
   - Assurez-vous que le compte PayPal a suffisamment de fonds

3. **Les transactions n'apparaissent pas dans l'historique**
   - Vérifiez que la transaction a bien été enregistrée dans la base de données
   - Assurez-vous que l'utilisateur a les permissions nécessaires

## Ressources

- [Documentation PayPal](https://developer.paypal.com/docs/checkout/)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox](https://www.sandbox.paypal.com/)
