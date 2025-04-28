import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    const props = {
      name: 'John Doe',
      contribution: '100€ / mois',
      image: 'https://example.com/avatar.jpg'
    };

    render(<UserProfile {...props} />);

    // Vérifier que le nom de l'utilisateur est affiché
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Vérifier que la contribution est affichée
    expect(screen.getByText('100€ / mois')).toBeInTheDocument();

    // Vérifier que l'avatar est présent avec la bonne URL
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders default avatar when image is not provided', () => {
    const props = {
      name: 'John Doe',
      contribution: '100€ / mois'
    };

    render(<UserProfile {...props} />);

    // Vérifier que l'icône User est présente (pas d'image)
    const userIcon = document.querySelector('svg.text-primary');
    expect(userIcon).toBeInTheDocument();
  });
});
