# Guide de test pour l'application Naat

Ce document explique comment exécuter les tests et comment écrire de nouveaux tests pour l'application Naat.

## Configuration des tests

L'application Naat utilise [Vitest](https://vitest.dev/) comme framework de test, avec [Testing Library](https://testing-library.com/) pour tester les composants React.

### Dépendances

Les dépendances suivantes sont utilisées pour les tests :

- `vitest` : Framework de test
- `@testing-library/react` : Utilitaires pour tester les composants React
- `@testing-library/jest-dom` : Matchers personnalisés pour Jest
- `@testing-library/user-event` : Utilitaires pour simuler les interactions utilisateur
- `jsdom` : Implémentation de DOM pour Node.js

### Fichiers de configuration

- `vitest.config.ts` : Configuration de Vitest
- `src/test/setup.ts` : Configuration des tests

## Exécution des tests

### Exécuter tous les tests

```bash
npm run test
```

### Exécuter les tests en mode watch

```bash
npm run test:watch
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

### Exécuter les tests avec l'interface utilisateur

```bash
npm run test:ui
```

## Écriture de tests

### Tests unitaires pour les composants

Les tests unitaires pour les composants sont placés dans des fichiers `.test.tsx` à côté des fichiers de composants.

Exemple de test pour le composant `TontineGroup` :

```tsx
// src/components/TontineGroup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TontineGroup from './TontineGroup';

describe('TontineGroup', () => {
  it('renders correctly with all props', () => {
    const mockOnClick = vi.fn();
    
    render(
      <TontineGroup
        name="Test Group"
        members={5}
        contribution="$100 / monthly"
        nextDue="2023-12-31"
        status="active"
        progress={75}
        onClick={mockOnClick}
      />
    );
    
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('$100 / monthly')).toBeInTheDocument();
    expect(screen.getByText('2023-12-31')).toBeInTheDocument();
    
    // Tester le clic
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('displays correct status badge', () => {
    render(
      <TontineGroup
        name="Test Group"
        members={5}
        contribution="$100 / monthly"
        nextDue="2023-12-31"
        status="pending"
        progress={50}
        onClick={() => {}}
      />
    );
    
    const badge = screen.getByText('pending');
    expect(badge).toBeInTheDocument();
    // Vérifier la classe de couleur pour le statut pending
    expect(badge.closest('div')).toHaveClass('bg-yellow-500');
  });
});
```

### Tests d'intégration

Les tests d'intégration sont placés dans le dossier `src/test/integration`.

Exemple de test d'intégration pour le flux de création de groupe :

```tsx
// src/test/integration/CreateGroup.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import CreateGroupModal from '@/components/CreateGroupModal';

// Mock des services
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 1, name: 'New Group' },
      error: null,
    }),
  },
}));

describe('Create Group Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('allows user to create a new group', async () => {
    const onSubmitMock = vi.fn();
    
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <CreateGroupModal
              isOpen={true}
              onClose={() => {}}
              onSubmit={onSubmitMock}
            />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/nom du groupe/i), {
      target: { value: 'Test Group' },
    });
    
    fireEvent.change(screen.getByLabelText(/montant de contribution/i), {
      target: { value: '100' },
    });
    
    // Sélectionner la fréquence
    fireEvent.click(screen.getByLabelText(/fréquence/i));
    fireEvent.click(screen.getByText(/mensuel/i));
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText(/créer le groupe/i));
    
    // Vérifier que onSubmit a été appelé avec les bonnes données
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        name: 'Test Group',
        contribution: '100',
        frequency: 'monthly',
        members: '',
      });
    });
  });
});
```

### Mocking

Vitest fournit des fonctions pour créer des mocks :

```tsx
// Créer un mock de fonction
const mockFn = vi.fn();

// Créer un mock de module
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    // ...
  },
}));

// Espionner une méthode
const spy = vi.spyOn(object, 'method');

// Réinitialiser les mocks
vi.clearAllMocks();
```

## Bonnes pratiques

### Tester le comportement, pas l'implémentation

Testez ce que l'utilisateur voit et fait, pas les détails d'implémentation.

```tsx
// Bon : Tester ce que l'utilisateur voit
expect(screen.getByText('Test Group')).toBeInTheDocument();

// Mauvais : Tester les détails d'implémentation
expect(component.state.name).toBe('Test Group');
```

### Utiliser les rôles ARIA

Utilisez les rôles ARIA pour sélectionner les éléments, car c'est ainsi que les utilisateurs perçoivent l'interface.

```tsx
// Bon : Utiliser les rôles ARIA
const button = screen.getByRole('button', { name: /submit/i });

// Mauvais : Utiliser les sélecteurs CSS
const button = screen.getByTestId('submit-button');
```

### Tester les cas d'erreur

N'oubliez pas de tester les cas d'erreur, pas seulement les cas de succès.

```tsx
it('displays error message when form submission fails', async () => {
  // Configurer le mock pour simuler une erreur
  vi.mock('@/utils/supabase', () => ({
    supabase: {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Error creating group' },
      }),
    },
  }));
  
  // Rendre le composant et soumettre le formulaire
  
  // Vérifier que le message d'erreur est affiché
  await waitFor(() => {
    expect(screen.getByText(/error creating group/i)).toBeInTheDocument();
  });
});
```

### Utiliser les fixtures

Utilisez des fixtures pour les données de test répétitives.

```tsx
// src/test/fixtures/groups.ts
export const mockGroups = [
  {
    id: 1,
    name: 'Test Group 1',
    members: 5,
    contribution: 100,
    frequency: 'monthly',
    nextDue: '2023-12-31',
    status: 'active',
    progress: 75,
  },
  // ...
];
```

## Ressources

- [Documentation Vitest](https://vitest.dev/guide/)
- [Documentation Testing Library](https://testing-library.com/docs/)
- [Documentation Jest DOM](https://github.com/testing-library/jest-dom)
- [Documentation User Event](https://testing-library.com/docs/user-event/intro/)
