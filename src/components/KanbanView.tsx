import React from 'react';
import { motion } from 'framer-motion';
import { Group } from '@/types/group';
import { useApp } from '@/contexts/AppContext';
import TontineGroup from './TontineGroup';

interface KanbanViewProps {
  groups: Group[];
  onGroupStatusChange: (groupId: string | number, newStatus: "active" | "pending" | "completed") => void;
  formatContribution: (amount: number, frequency: string) => string;
  onCardClick: (groupId: string | number) => void;
  onWhatsAppClick: (group: Group) => void;
  favoriteGroups: string[];
  onToggleFavorite: (groupId: string | number) => void;
  onShareViaQRCode: (group: Group) => void;
}

export default function KanbanView({
  groups,
  onGroupStatusChange,
  formatContribution,
  onCardClick,
  onWhatsAppClick,
  favoriteGroups,
  onToggleFavorite,
  onShareViaQRCode
}: KanbanViewProps) {
  const { t } = useApp();

  // Filtrer les groupes par statut
  const activeGroups = groups.filter(group => group.status === 'active');
  const pendingGroups = groups.filter(group => group.status === 'pending');
  const completedGroups = groups.filter(group => group.status === 'completed');

  // Fonction pour rendre une colonne
  const renderColumn = (title: string, items: Group[], bgColor: string, borderColor: string) => (
    <div className="flex-1 min-w-[300px]">
      <div className={`${bgColor} p-3 rounded-t-lg border-b-2 ${borderColor}`}>
        <h3 className="font-medium flex items-center">
          <span className={`w-3 h-3 rounded-full ${borderColor} mr-2`}></span>
          {title} ({items.length})
        </h3>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm p-3 space-y-3 min-h-[300px]">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('noItems')}</p>
          </div>
        ) : (
          items.map(group => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -4, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <TontineGroup
                id={group.id}
                name={group.name}
                members={group.members}
                contribution={formatContribution(group.contribution, group.frequency)}
                nextDue={group.nextDue}
                status={group.status}
                progress={group.progress}
                tags={group.tags}
                onClick={() => onCardClick(group.id)}
                isFavorite={favoriteGroups.includes(String(group.id))}
                onToggleFavorite={(e) => onToggleFavorite(group.id)}
                onWhatsAppClick={(e) => onWhatsAppClick(group)}
                onShareViaQRCode={(e) => onShareViaQRCode(group)}
                variant="minimal"
                compact={true}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      className="flex gap-4 min-w-full pb-4 overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Colonne Active */}
      {renderColumn(
        t('active'),
        activeGroups,
        'bg-green-50 dark:bg-green-900/20',
        'border-green-500'
      )}

      {/* Colonne En attente */}
      {renderColumn(
        t('pending'),
        pendingGroups,
        'bg-yellow-50 dark:bg-yellow-900/20',
        'border-yellow-500'
      )}

      {/* Colonne Terminé */}
      {renderColumn(
        t('completed'),
        completedGroups,
        'bg-blue-50 dark:bg-blue-900/20',
        'border-blue-500'
      )}
    </motion.div>
  );
}
