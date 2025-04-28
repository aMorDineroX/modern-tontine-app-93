# Documentation Technique de Naat

## Architecture du projet

Naat est une application React moderne construite avec les technologies suivantes:

- **React 18.3** - Bibliothèque UI
- **TypeScript 5.5** - Typage statique
- **Vite 5.4** - Bundler et serveur de développement
- **React Router 6** - Routage côté client
- **Tailwind CSS 3.4** - Framework CSS utilitaire
- **Shadcn UI** - Composants UI réutilisables
- **Supabase** - Backend as a Service (BaaS)
- **React Query** - Gestion des requêtes et du cache
- **Vitest** - Framework de test
- **Cypress** - Tests de bout en bout

## Structure des dossiers

```
naat/
├── cypress/              # Tests de bout en bout
├── docs/                 # Documentation
├── public/               # Fichiers statiques
├── src/                  # Code source
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Composants React
│   │   └── ui/           # Composants UI réutilisables
│   ├── contexts/         # Contextes React
│   ├── hooks/            # Hooks personnalisés
│   ├── layouts/          # Layouts de page
│   ├── lib/              # Bibliothèques et utilitaires
│   ├── pages/            # Pages de l'application
│   ├── test/             # Tests unitaires et d'intégration
│   ├── types/            # Types TypeScript
│   └── utils/            # Fonctions utilitaires
├── .github/              # Configuration GitHub Actions
└── ...                   # Fichiers de configuration
```

## Patterns et conventions

### Architecture des composants

Nous utilisons une architecture basée sur les composants avec les conventions suivantes:

1. **Composants fonctionnels** - Tous les composants sont des fonctions, pas des classes.
2. **Hooks** - Nous utilisons les hooks React pour la gestion de l'état et des effets.
3. **Composants contrôlés** - Les composants de formulaire sont contrôlés par React.
4. **Composition** - Nous préférons la composition à l'héritage.

Exemple de composant:

```tsx
import React from 'react';
import { useApp } from '@/contexts/AppContext';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const { t } = useApp();
  
  return (
    <button 
      className={`button button-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Gestion de l'état

Nous utilisons plusieurs approches pour la gestion de l'état:

1. **État local** - `useState` pour l'état spécifique à un composant.
2. **Contexte React** - Pour l'état global partagé entre plusieurs composants.
3. **React Query** - Pour l'état serveur et les requêtes API.

#### Contextes

Les contextes sont utilisés pour partager l'état global:

- `AppContext` - Langue, devise, thème, etc.
- `AuthContext` - Authentification et utilisateur.

### Gestion des styles

Nous utilisons Tailwind CSS avec les conventions suivantes:

1. **Classes utilitaires** - Nous utilisons les classes utilitaires de Tailwind directement dans les composants.
2. **Composants UI** - Nous utilisons Shadcn UI pour les composants de base.
3. **Thème** - Nous supportons les thèmes clair et sombre.

### Gestion des routes

Nous utilisons React Router avec une structure de routes déclarative:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="groups" element={<Groups />} />
    <Route path="profile" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

### Tests

Nous utilisons plusieurs niveaux de tests:

1. **Tests unitaires** - Tests de composants et fonctions isolés.
2. **Tests d'intégration** - Tests de l'interaction entre plusieurs composants.
3. **Tests de bout en bout** - Tests du flux utilisateur complet.

#### Tests unitaires

Les tests unitaires sont écrits avec Vitest et React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Tests de bout en bout

Les tests de bout en bout sont écrits avec Cypress:

```ts
describe('Authentication Flow', () => {
  it('should allow a user to sign in', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Documentation du code

Nous utilisons JSDoc pour documenter le code:

```tsx
/**
 * Composant Button - Bouton réutilisable avec différentes variantes
 * 
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu du bouton
 * @param {() => void} props.onClick - Fonction appelée lors du clic
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - Variante du bouton
 * @example
 * return (
 *   <Button onClick={() => console.log('Clicked')} variant="primary">
 *     Click me
 *   </Button>
 * )
 */
```

## Intégration avec Supabase

Nous utilisons Supabase comme backend avec les fonctionnalités suivantes:

1. **Authentification** - Gestion des utilisateurs et des sessions.
2. **Base de données** - Stockage des données dans PostgreSQL.
3. **Stockage** - Stockage des fichiers.
4. **Fonctions Edge** - Logique côté serveur.

### Modèle de données

Voici les principales tables de la base de données:

- `profiles` - Informations sur les utilisateurs
- `groups` - Groupes de tontine
- `group_members` - Membres des groupes
- `contributions` - Contributions des membres
- `payouts` - Paiements aux membres
- `transactions` - Historique des transactions

## CI/CD

Nous utilisons GitHub Actions pour l'intégration continue et le déploiement continu:

1. **Tests** - Exécution des tests unitaires et d'intégration.
2. **Couverture de code** - Génération de rapports de couverture.
3. **Déploiement** - Déploiement automatique sur les environnements de staging et production.

## Bonnes pratiques

1. **Code propre** - Suivre les principes SOLID et DRY.
2. **Tests** - Écrire des tests pour toutes les fonctionnalités.
3. **Documentation** - Documenter le code avec JSDoc.
4. **Accessibilité** - Suivre les normes WCAG.
5. **Performance** - Optimiser les performances avec React.memo, useMemo, useCallback.
6. **Sécurité** - Suivre les bonnes pratiques de sécurité.

## Ressources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
