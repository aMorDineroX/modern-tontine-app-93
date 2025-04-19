# Naat - Application Moderne de Tontine

<p align="center">
  <img src="public/logo.svg" alt="Naat Logo" width="200" />
</p>

## À propos de Naat

Naat est une application moderne de tontine conçue pour simplifier la gestion des groupes d'épargne rotative et des contributions financières collectives. Inspirée par les pratiques traditionnelles de tontine répandues en Afrique et dans d'autres régions du monde, Naat apporte une solution numérique sécurisée et transparente pour gérer ces systèmes d'épargne communautaire.

### Qu'est-ce qu'une tontine ?

Une tontine est un système d'épargne collective où les membres d'un groupe contribuent régulièrement à un fonds commun. À tour de rôle, chaque membre reçoit la totalité des contributions collectées. Ce système favorise l'épargne disciplinée et l'entraide financière au sein des communautés.

### Notre mission

Naat vise à préserver l'esprit communautaire des tontines traditionnelles tout en offrant les avantages de la technologie moderne : sécurité, transparence, accessibilité et facilité d'utilisation.

## Fonctionnalités principales

### Gestion de groupes
- Création et gestion de multiples groupes de tontine
- Invitation de membres par email ou partage de lien
- Définition des règles de contribution et des calendriers de paiement

### Suivi financier
- Tableau de bord intuitif pour visualiser l'état des contributions
- Historique détaillé des transactions
- Notifications pour les paiements à venir et les échéances

### Cycles de tontine
- Gestion des cycles de rotation pour les versements
- Options flexibles : rotation fixe, sélection aléatoire ou système d'enchères
- Calendrier interactif des paiements

### Sécurité et transparence
- Authentification sécurisée
- Historique complet des activités
- Rapports et statistiques détaillés

### Multi-langues et multi-devises
- Interface disponible en français, anglais, espagnol, arabe et swahili
- Support de différentes devises pour les groupes internationaux

## Captures d'écran

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Tableau de bord" width="45%" />
  <img src="docs/screenshots/groups.png" alt="Gestion des groupes" width="45%" />
</p>

## Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation

```sh
# Cloner le dépôt
git clone https://github.com/aMorDineroX/modern-tontine-app-93.git

# Accéder au répertoire du projet
cd modern-tontine-app-93

# Installer les dépendances
npm install
# ou
yarn install

# Démarrer le serveur de développement
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse `http://localhost:8080` (ou un autre port si le 8080 est déjà utilisé).

## Technologies utilisées

Naat est construit avec des technologies modernes pour offrir une expérience utilisateur fluide et réactive :

- **Frontend** : React, TypeScript, Tailwind CSS
- **UI Components** : shadcn-ui
- **Build Tool** : Vite
- **Backend** : Supabase (Authentication, Database)
- **State Management** : React Context API
- **Routing** : React Router
- **Animations** : Framer Motion
- **Internationalisation** : Custom i18n solution

## Déploiement

L'application peut être déployée sur diverses plateformes :

- Vercel
- Netlify
- GitHub Pages
- AWS Amplify
- Firebase Hosting

## Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer à Naat :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter à support@naat-app.com

---

<p align="center">
  Naat - Moderniser l'épargne communautaire, préserver les traditions
</p>
