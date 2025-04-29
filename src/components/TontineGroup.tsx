import React from 'react';
import { Users, Calendar, Clock, Coins, Tag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import TagBadge from './TagBadge';

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
  /** Tags associés au groupe */
  tags?: string[];
  /** Fonction appelée lors du clic sur la carte */
  onClick: () => void;
  /** Actions supplémentaires */
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
  }>;
  /** Afficher en mode compact */
  compact?: boolean;
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
  tags = [],
  onClick,
  actions = [],
  compact = false
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

  // Obtenir l'icône du statut
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <Clock size={compact ? 14 : 16} className="mr-2 text-green-500" />;
      case 'pending':
        return <Clock size={compact ? 14 : 16} className="mr-2 text-yellow-500" />;
      case 'completed':
        return <Clock size={compact ? 14 : 16} className="mr-2 text-blue-500" />;
      default:
        return <Clock size={compact ? 14 : 16} className="mr-2 text-gray-500" />;
    }
  };

  // Gérer le clic sur une action
  const handleActionClick = (e: React.MouseEvent, action: typeof actions[0]) => {
    e.stopPropagation();
    action.onClick(e);
  };

  return (
    <motion.button
      onClick={onClick}
      className={`tontine-card w-full text-left transition-all hover:shadow-md cursor-pointer ${
        compact ? 'p-3' : 'p-4'
      } h-full flex flex-col`}
      aria-label={`Groupe ${name}`}
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg truncate dark:text-white">{name}</h3>
        <Badge className={getStatusColor()}>{status}</Badge>
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <Users size={compact ? 14 : 16} className="mr-2 text-primary" />
            <span className="truncate">{members} membres</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <Calendar size={compact ? 14 : 16} className="mr-2 text-primary" />
            <span className="truncate">{nextDue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-primary/10 rounded-md">
          <div className="flex items-center flex-1 min-w-0">
            <Coins size={compact ? 14 : 16} className="mr-2 flex-shrink-0 text-primary" />
            <span className="text-sm font-medium text-primary truncate">{contribution}</span>
          </div>
          <div className="flex items-center ml-2 flex-shrink-0">
            {getStatusIcon()}
            <span className="text-xs font-medium">{status}</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progression du cycle</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <TagBadge
                key={index}
                tag={tag}
                className="text-[10px] px-1.5 py-0"
              />
            ))}
          </div>
        )}

        <div className="flex-grow"></div>

        {actions.length > 0 && (
          <div className="flex justify-end space-x-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
            {actions.map((action, index) => (
              <motion.button
                key={index}
                onClick={(e) => handleActionClick(e, action)}
                className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                aria-label={action.label}
                title={action.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {action.icon}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
});

export default TontineGroup;
