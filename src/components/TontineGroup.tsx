import React from 'react';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

/**
 * Interface des propriétés du composant TontineGroup
 */
interface TontineGroupProps {
  /** Nom du groupe de tontine */
  name: string;
  /** Nombre de membres dans le groupe */
  members: number;
  /** Montant et fréquence de contribution (formaté) */
  contribution: string;
  /** Date de la prochaine échéance */
  nextDue: string;
  /** Statut du groupe */
  status?: 'active' | 'pending' | 'completed';
  /** Progression du cycle actuel (0-100) */
  progress?: number;
  /** Fonction appelée lors du clic sur la carte */
  onClick: () => void;
  /** Actions supplémentaires */
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
  }>;
}

/**
 * Composant TontineGroup - Affiche un groupe de tontine sous forme de carte
 * 
 * @component
 * @example
 * <TontineGroup
 *   name="Famille Épargne"
 *   members={8}
 *   contribution="50€ / mensuel"
 *   nextDue="15 juin 2023"
 *   status="active"
 *   progress={75}
 *   onClick={() => navigate(`/groups/${groupId}`)}
 * />
 */
const TontineGroup = React.memo(function TontineGroup({
  name,
  members,
  contribution,
  nextDue,
  status = 'active',
  progress = 0,
  onClick,
  actions = []
}: TontineGroupProps) {
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

  // Gérer le clic sur une action
  const handleActionClick = (e: React.MouseEvent, action: typeof actions[0]) => {
    e.stopPropagation();
    action.onClick(e);
  };

  return (
    <button
      onClick={onClick}
      className="tontine-card w-full text-left transition-all hover:translate-y-[-2px] cursor-pointer"
      aria-label={`Groupe ${name}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg truncate dark:text-white">{name}</h3>
        <Badge className={getStatusColor()}>{status}</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Users size={16} className="mr-2" />
          <span>{members}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} className="mr-2" />
          <span>{nextDue}</span>
        </div>

        <div className="flex items-center text-sm font-medium">
          <span className="text-primary dark:text-primary">{contribution}</span>
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => handleActionClick(e, action)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});

export default TontineGroup;
