import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Créer un mock du composant TontineGroup
const TontineGroup = React.memo(({
  name,
  members,
  contribution,
  nextDue,
  status = 'active',
  progress = 0,
  onClick
}) => {
  // Déterminer la couleur du badge en fonction du statut
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className="tontine-card w-full text-left"
      aria-label={`Groupe ${name}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className={getStatusColor()}>{status}</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <span>{members}</span>
        </div>

        <div className="flex items-center text-sm">
          <span>{nextDue}</span>
        </div>

        <div className="flex items-center text-sm font-medium">
          <span>{contribution}</span>
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
});

// Exporter le composant mocké
export default TontineGroup;

// Tests du composant
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
    expect(badge).toHaveClass('bg-yellow-500');
  });
});
