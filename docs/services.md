# Services de l'application Naat

Ce document décrit les différents services disponibles dans l'application Naat et comment les utiliser.

## Table des matières

1. [Service de notification](#service-de-notification)
2. [Service d'analyse et de statistiques](#service-danalyse-et-de-statistiques)
3. [Service de géolocalisation](#service-de-géolocalisation)
4. [Service d'exportation de données](#service-dexportation-de-données)
5. [Service de gestion des documents](#service-de-gestion-des-documents)
6. [Service WhatsApp](#service-whatsapp)
7. [Service PayPal](#service-paypal)
8. [Service de chat](#service-de-chat)
9. [Service de tontine](#service-de-tontine)
10. [Service d'erreur](#service-derreur)

## Service de notification

Le service de notification permet d'envoyer des notifications aux utilisateurs via différents canaux (in-app, email, SMS, WhatsApp).

### Fonctionnalités principales

- Création de notifications
- Récupération des notifications d'un utilisateur
- Marquage des notifications comme lues
- Envoi de notifications par différents canaux

### Exemple d'utilisation

```typescript
import { createNotification, NotificationType, NotificationChannel } from '@/services';

// Créer une notification in-app
const result = await createNotification({
  user_id: 'user123',
  type: NotificationType.PAYMENT_DUE,
  title: 'Paiement à effectuer',
  message: 'Vous avez un paiement de 100€ à effectuer pour le groupe "Amis"',
  channel: NotificationChannel.IN_APP,
  metadata: {
    group_id: 1,
    amount: 100
  }
});

// Envoyer une notification de paiement dû
const result = await sendPaymentDueNotification(
  'user123',
  1,
  'Amis',
  100,
  '2023-12-31',
  [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
);
```

## Service d'analyse et de statistiques

Le service d'analyse et de statistiques permet de collecter et d'analyser les données d'utilisation de l'application pour fournir des statistiques utiles aux utilisateurs.

### Fonctionnalités principales

- Statistiques utilisateur (contributions, paiements, groupes)
- Statistiques de groupe (membres, contributions, paiements)
- Statistiques système (pour les administrateurs)
- Suivi des événements

### Exemple d'utilisation

```typescript
import { getUserStatistics, getGroupStatistics, trackEvent } from '@/services';

// Récupérer les statistiques d'un utilisateur
const { data: userStats } = await getUserStatistics('user123');

// Récupérer les statistiques d'un groupe
const { data: groupStats } = await getGroupStatistics(1);

// Suivre un événement
await trackEvent('user123', 'page_view', { page: 'dashboard' });
```

## Service de géolocalisation

Le service de géolocalisation permet d'utiliser la géolocalisation pour améliorer l'expérience utilisateur, notamment pour trouver des groupes à proximité ou organiser des rencontres.

### Fonctionnalités principales

- Récupération de la position actuelle
- Enregistrement de la position d'un utilisateur ou d'un groupe
- Recherche de groupes à proximité
- Recherche de membres à proximité
- Recherche de lieux de rencontre à proximité
- Géocodage d'adresses

### Exemple d'utilisation

```typescript
import { getCurrentPosition, findNearbyGroups, geocodeAddress } from '@/services';

// Récupérer la position actuelle
const { data: location } = await getCurrentPosition();

// Rechercher des groupes à proximité
const { data: groups } = await findNearbyGroups(location, 10);

// Géocoder une adresse
const { data: location } = await geocodeAddress('1 rue de la Paix, Paris');
```

## Service d'exportation de données

Le service d'exportation de données permet aux utilisateurs d'exporter leurs données dans différents formats (PDF, CSV, Excel) pour un usage externe.

### Fonctionnalités principales

- Exportation des contributions d'un utilisateur
- Exportation des paiements reçus par un utilisateur
- Exportation des transactions PayPal
- Exportation des données d'un groupe
- Support de différents formats (PDF, CSV, Excel, JSON)

### Exemple d'utilisation

```typescript
import { exportUserContributions, exportGroupData, ExportFormat } from '@/services';

// Exporter les contributions d'un utilisateur en PDF
const result = await exportUserContributions('user123', {
  format: ExportFormat.PDF,
  fileName: 'mes_contributions',
  dateRange: {
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  }
});

// Exporter les données d'un groupe en Excel
const result = await exportGroupData(1, {
  format: ExportFormat.EXCEL,
  fileName: 'groupe_amis'
});
```

## Service de gestion des documents

Le service de gestion des documents permet aux utilisateurs de gérer des documents liés à leurs groupes de tontine (contrats, reçus, etc.).

### Fonctionnalités principales

- Téléchargement de documents
- Création, récupération, mise à jour et suppression de documents
- Partage de documents avec d'autres utilisateurs
- Génération de contrats de tontine
- Génération de reçus de paiement

### Exemple d'utilisation

```typescript
import { uploadFile, createDocument, generateTontineContract, DocumentType } from '@/services';

// Télécharger un fichier
const { data: fileInfo } = await uploadFile(file, 'contracts');

// Créer un document
const result = await createDocument({
  name: 'Contrat de tontine',
  type: DocumentType.CONTRACT,
  file_path: fileInfo.path,
  file_size: file.size,
  file_type: file.type,
  user_id: 'user123',
  group_id: 1
});

// Générer un contrat de tontine
const { data: contract } = await generateTontineContract(1, 'user123');
```

## Service WhatsApp

Le service WhatsApp permet d'intégrer des fonctionnalités de messagerie WhatsApp dans l'application.

### Fonctionnalités principales

- Envoi de messages WhatsApp
- Utilisation de modèles de message
- Gestion des contacts WhatsApp
- Envoi de messages à tous les membres d'un groupe
- Partage de groupes via WhatsApp
- Envoi de rappels de paiement

### Exemple d'utilisation

```typescript
import { sendWhatsAppMessage, shareGroupViaWhatsApp, sendPaymentReminderViaWhatsApp } from '@/services';

// Envoyer un message WhatsApp
const result = await sendWhatsAppMessage(
  '+33612345678',
  'Bonjour ! Voici un message de test.'
);

// Partager un groupe via WhatsApp
await shareGroupViaWhatsApp(1, 'https://naat.app/join/123456');

// Envoyer un rappel de paiement
await sendPaymentReminderViaWhatsApp('user123', 1, 100, '2023-12-31');
```

## Service PayPal

Le service PayPal permet d'intégrer des fonctionnalités de paiement PayPal dans l'application.

### Fonctionnalités principales

- Enregistrement des transactions PayPal
- Récupération des transactions d'un utilisateur
- Mise à jour du statut des transactions
- Gestion des remboursements
- Gestion des abonnements

### Exemple d'utilisation

```typescript
import { savePayPalTransaction, getUserPayPalTransactions, cancelPayPalSubscription } from '@/services';

// Enregistrer une transaction PayPal
const result = await savePayPalTransaction({
  user_id: 'user123',
  transaction_id: 'txn_123456',
  amount: 100,
  currency: 'EUR',
  status: 'completed',
  type: 'payment',
  description: 'Contribution au groupe Amis'
});

// Récupérer les transactions d'un utilisateur
const { data: transactions } = await getUserPayPalTransactions('user123');

// Annuler un abonnement
await cancelPayPalSubscription('sub_123456');
```

## Service de chat

Le service de chat permet de gérer les conversations entre utilisateurs.

### Fonctionnalités principales

- Création de messages
- Création de conversations
- Ajout de messages à une conversation
- Génération de réponses automatiques

### Exemple d'utilisation

```typescript
import { createMessage, createConversation, addMessageToConversation } from '@/services';

// Créer un message
const message = createMessage(
  'user123',
  'John Doe',
  'Bonjour ! Comment ça va ?'
);

// Créer une conversation
const conversation = createConversation(
  [
    { id: 'user123', name: 'John Doe' },
    { id: 'user456', name: 'Jane Doe' }
  ]
);

// Ajouter un message à une conversation
const updatedConversation = addMessageToConversation(conversation, message);
```

## Service de tontine

Le service de tontine permet de gérer les groupes de tontine, les membres, les contributions et les paiements.

### Fonctionnalités principales

- Création et gestion des groupes de tontine
- Gestion des membres des groupes
- Enregistrement des contributions
- Planification des paiements
- Mise à jour des profils utilisateur

### Exemple d'utilisation

```typescript
import { createTontineGroup, getUserGroups, addMemberToGroup, recordContribution } from '@/services';

// Créer un groupe de tontine
const group = await createTontineGroup({
  name: 'Amis',
  contribution_amount: 100,
  frequency: 'monthly',
  start_date: '2023-01-01',
  payout_method: 'rotation',
  created_by: 'user123'
});

// Récupérer les groupes d'un utilisateur
const groups = await getUserGroups('user123');

// Ajouter un membre à un groupe
await addMemberToGroup(1, 'user456', 'member');

// Enregistrer une contribution
await recordContribution({
  user_id: 'user123',
  group_id: 1,
  amount: 100,
  payment_date: '2023-01-15',
  status: 'completed'
});
```

## Service d'erreur

Le service d'erreur permet de gérer les erreurs de manière centralisée dans l'application.

### Fonctionnalités principales

- Création d'erreurs typées
- Gestion des erreurs Supabase
- Affichage des erreurs dans des toasts

### Exemple d'utilisation

```typescript
import { createError, handleSupabaseError, useErrorHandler, ErrorType } from '@/services';

// Créer une erreur
const error = createError(
  ErrorType.VALIDATION,
  'Le champ email est requis',
  'FIELD_REQUIRED'
);

// Gérer une erreur Supabase
const appError = handleSupabaseError(error);

// Utiliser le gestionnaire d'erreurs avec les toasts
const { handleError } = useErrorHandler(toast);
handleError(error);
```
