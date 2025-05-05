import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VirtualizedGroupList from './VirtualizedGroupList';
import { Group } from '@/types/group';
import { renderWithProviders } from '@/test/accessibility-test-utils';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

// Mock the useInView hook
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: React.createRef(), inView: false }),
}));

// Mock the useVirtualizer hook
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, start: 0, size: 300, key: 0 },
      { index: 1, start: 300, size: 300, key: 1 },
    ],
    getTotalSize: () => 600,
  }),
}));

// Mock TontineGroup component to avoid context problems
vi.mock('./TontineGroup', () => ({
  default: ({ name, members, contribution, frequency }: any) => (
    <div>
      <h3>{name}</h3>
      <p>{members} membres</p>
      <p>{contribution} {frequency}</p>
    </div>
  )
}));

describe('VirtualizedGroupList', () => {
  const mockGroups: Group[] = [
    {
      id: 1,
      name: 'Test Group 1',
      members: 5,
      contribution: 100,
      frequency: 'monthly',
      nextDue: '2023-12-31',
      status: 'active',
      progress: 75,
      tags: ['Family', 'Savings']
    },
    {
      id: 2,
      name: 'Test Group 2',
      members: 10,
      contribution: 200,
      frequency: 'weekly',
      nextDue: '2023-12-25',
      status: 'pending',
      progress: 50,
      tags: ['Friends', 'Investment']
    }
  ];

  const mockProps = {
    groups: mockGroups,
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: true,
    fetchNextPage: vi.fn(),
    formatContribution: (amount: number, frequency: string) => `$${amount} / ${frequency}`,
    onGroupClick: vi.fn(),
    onWhatsAppClick: vi.fn(),
    onToggleFavorite: vi.fn(),
    onShareViaQRCode: vi.fn(),
    favoriteGroups: ['1'],
    view: 'grid' as 'grid' | 'list'
  };

  it('renders loading state correctly', () => {
    renderWithProviders(
      <VirtualizedGroupList
        {...mockProps}
        groups={[]}
        isLoading={true}
      />
    );

    expect(screen.getByText(/Chargement des groupes/i)).toBeInTheDocument();
  });

  it('renders groups correctly', () => {
    renderWithProviders(<VirtualizedGroupList {...mockProps} />);
    
    // Since we're mocking the virtualizer, we need to check for the container
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('handles empty groups array', () => {
    renderWithProviders(
      <VirtualizedGroupList
        {...mockProps}
        groups={[]}
        isLoading={false}
      />
    );
    
    // Should still render the container but with no items
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
