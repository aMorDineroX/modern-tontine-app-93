<div align="center">

# Naat

### Application Moderne de Tontine

<img src="public/logo.svg" alt="Naat Logo" width="200" />

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

*Moderniser l'épargne communautaire, préserver les traditions*

[Fonctionnalités](#fonctionnalités-principales) •
[Captures d'écran](#captures-décran) •
[Installation](#installation-et-démarrage) •
[Technologies](#technologies-utilisées) •
[Contribution](#contribution) •
[Contact](#contact)

</div>

## 📋 À propos de Naat

Naat est une application moderne de tontine conçue pour simplifier la gestion des groupes d'épargne rotative et des contributions financières collectives. Inspirée par les pratiques traditionnelles de tontine répandues en Afrique et dans d'autres régions du monde, Naat apporte une solution numérique sécurisée et transparente pour gérer ces systèmes d'épargne communautaire.

### 🔄 Qu'est-ce qu'une tontine ?

Une tontine est un système d'épargne collective où les membres d'un groupe contribuent régulièrement à un fonds commun. À tour de rôle, chaque membre reçoit la totalité des contributions collectées. Ce système favorise l'épargne disciplinée et l'entraide financière au sein des communautés.

<details>
<summary><strong>En savoir plus sur les tontines</strong></summary>

Les tontines existent depuis des siècles et sont pratiquées dans de nombreuses cultures à travers le monde sous différents noms :
- **Susu** en Afrique de l'Ouest
- **Chit funds** en Inde
- **Tandas** au Mexique
- **Hui** en Chine
- **Stokvel** en Afrique du Sud

Ces systèmes d'épargne communautaire offrent plusieurs avantages :
- Accès à des fonds importants sans intérêts bancaires
- Renforcement des liens sociaux et de la confiance mutuelle
- Discipline d'épargne encouragée par la pression sociale positive
- Inclusion financière pour les personnes non bancarisées

</details>

### 🚀 Notre mission

Naat vise à préserver l'esprit communautaire des tontines traditionnelles tout en offrant les avantages de la technologie moderne :

- **Sécurité** : Protection des données et des transactions
- **Transparence** : Visibilité complète sur les contributions et distributions
- **Accessibilité** : Interface intuitive accessible sur tous les appareils
- **Facilité d'utilisation** : Automatisation des tâches administratives
- **Communication** : Intégration avec WhatsApp pour faciliter les échanges

## ✨ Fonctionnalités principales

<div align="center">
<table>
<tr>
<td width="50%">

### 👥 Gestion de groupes
- Création et gestion de multiples groupes de tontine
- Invitation de membres par email ou partage de lien
- Définition des règles de contribution et des calendriers de paiement
- Intégration avec WhatsApp pour la communication de groupe

### 📊 Suivi financier
- Tableau de bord intuitif pour visualiser l'état des contributions
- Historique détaillé des transactions
- Notifications pour les paiements à venir et les échéances
- Rapports exportables en PDF ou Excel

</td>
<td width="50%">

### 🔄 Cycles de tontine
- Gestion des cycles de rotation pour les versements
- Options flexibles : rotation fixe, sélection aléatoire ou système d'enchères
- Calendrier interactif des paiements
- Rappels automatiques pour les échéances

### 🔒 Sécurité et transparence
- Authentification sécurisée avec vérification en deux étapes
- Historique complet des activités
- Rapports et statistiques détaillés
- Sauvegarde automatique des données

</td>
</tr>
</table>
</div>

### 🌐 Multi-langues et multi-devises
- Interface disponible en français, anglais, espagnol, arabe et swahili
- Support de différentes devises pour les groupes internationaux
- Conversion automatique des montants entre devises

### 📱 Communication intégrée
- Partage de groupe via WhatsApp
- Création de groupes WhatsApp pour les membres
- Notifications WhatsApp pour les rappels de paiement
- Codes QR pour rejoindre facilement les conversations

## 📸 Captures d'écran

<div align="center">
  <p><strong>Tableau de bord</strong> - Vue d'ensemble de vos groupes et activités</p>
  <img src="docs/screenshots/dashboard.png" alt="Tableau de bord" width="80%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />

  <p><strong>Gestion des groupes</strong> - Créez et gérez vos groupes de tontine</p>
  <img src="docs/screenshots/groups.png" alt="Gestion des groupes" width="80%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />

  <details>
  <summary><strong>Voir plus de captures d'écran</strong></summary>
  <p><strong>Profil utilisateur</strong> - Gérez vos informations personnelles</p>
  <img src="docs/screenshots/dashboard.png" alt="Profil utilisateur" width="80%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />

  <p><strong>Intégration WhatsApp</strong> - Communiquez facilement avec les membres</p>
  <img src="docs/screenshots/groups.png" alt="Intégration WhatsApp" width="80%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
  </details>
</div>

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Git

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

### Scripts disponibles

| Commande | Description |
|---------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile l'application pour la production |
| `npm run preview` | Prévisualise la version de production localement |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run test` | Lance les tests unitaires |

## 🛠️ Technologies utilisées

Naat est construit avec des technologies modernes pour offrir une expérience utilisateur fluide et réactive :

<div align="center">
<table>
<tr>
<td width="50%">

### Frontend
- **Framework** : [React 18](https://reactjs.org/)
- **Langage** : [TypeScript 5](https://www.typescriptlang.org/)
- **Styles** : [Tailwind CSS 3](https://tailwindcss.com/)
- **UI Components** : [shadcn-ui](https://ui.shadcn.com/)
- **Build Tool** : [Vite 5](https://vitejs.dev/)
- **Routing** : [React Router 6](https://reactrouter.com/)

</td>
<td width="50%">

### Backend & Services
- **Backend** : [Supabase](https://supabase.io/)
- **Authentication** : Supabase Auth
- **Database** : PostgreSQL (via Supabase)
- **State Management** : React Context API
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Internationalisation** : Solution i18n personnalisée

</td>
</tr>
</table>
</div>

### Architecture

L'application suit une architecture modulaire avec séparation des préoccupations :
- **Components** : Composants UI réutilisables
- **Pages** : Vues principales de l'application
- **Contexts** : Gestion de l'état global
- **Utils** : Fonctions utilitaires et helpers
- **Services** : Logique métier et appels API

## 🌐 Déploiement

L'application peut être déployée sur diverses plateformes :

| Plateforme | Commande/Méthode |
|-----------|------------------|
| [Vercel](https://vercel.com/) | `vercel` |
| [Netlify](https://www.netlify.com/) | `netlify deploy` |
| [GitHub Pages](https://pages.github.com/) | Via GitHub Actions |
| [AWS Amplify](https://aws.amazon.com/amplify/) | Console Amplify |
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | `firebase deploy` |

### Guide de déploiement rapide (Vercel)

```sh
# Installation de l'outil CLI Vercel
npm install -g vercel

# Déploiement en production
vercel --prod
```

## 👥 Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer à Naat :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

### Guide de contribution

Pour assurer la qualité du code et la cohérence du projet, veuillez suivre ces directives :

- Respectez les conventions de nommage existantes
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez votre code avec des commentaires clairs
- Suivez les principes de conception de l'interface utilisateur existants
- Assurez-vous que votre code passe les vérifications ESLint

### Signaler des bugs

Si vous trouvez un bug, veuillez [ouvrir une issue](https://github.com/aMorDineroX/modern-tontine-app-93/issues/new) en incluant :
- Une description claire du problème
- Les étapes pour reproduire le bug
- L'environnement dans lequel vous l'avez rencontré (navigateur, OS, etc.)
- Si possible, des captures d'écran ou des logs d'erreur

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter :

- **Email** : [support@naat-app.com](mailto:support@naat-app.com)
- **Site web** : [www.naat-app.com](https://www.naat-app.com)
- **Twitter** : [@NaatApp](https://twitter.com/NaatApp)

## 🙏 Remerciements

Nous tenons à remercier tous ceux qui ont contribué à ce projet, ainsi que les communautés open source dont les outils et bibliothèques ont rendu ce projet possible.

---

<div align="center">

### Naat - Moderniser l'épargne communautaire, préserver les traditions

<img src="public/logo.svg" alt="Naat Logo" width="60" />

</div>
