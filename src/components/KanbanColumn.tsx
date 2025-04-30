import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import KanbanCard from './KanbanCard';
import { Group } from '@/types/group';
import { useApp } from '@/contexts/AppContext';

interface KanbanColumnProps {
  id: string;
  title: string;
  items: Group[];
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  formatContribution: (amount: number, frequency: string) => string;
  onCardClick: (groupId: string | number) => void;
  onWhatsAppClick: (group: Group) => void;
  favoriteGroups: string[];
  onToggleFavorite: (groupId: string | number) => void;
  onShareViaQRCode: (group: Group) => void;
}

export default function KanbanColumn({
  id,
  title,
  items,
  color,
  borderColor,
  bgColor,
  textColor,
  formatContribution,
  onCardClick,
  onWhatsAppClick,
  favoriteGroups,
  onToggleFavorite,
  onShareViaQRCode
}: KanbanColumnProps) {
  const { t } = useApp();

  // Configuration de la zone de dépôt avec dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      status: id
    }
  });

  // Obtenir les IDs des éléments pour SortableContext
  const itemIds = items.map(item => item.id);

  return (
    <div className="flex-1 min-w-[300px]">
      <div className={`${bgColor} p-3 rounded-t-lg border-b-2 ${borderColor}`}>
        <h3 className={`font-medium ${textColor} flex items-center`}>
          <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
          {title} ({items.length})
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className={`bg-white dark:bg-gray-800 rounded-b-lg shadow-sm p-3 space-y-3 min-h-[300px] transition-colors ${
          isOver ? 'bg-gray-50 dark:bg-gray-700' : ''
        }`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('dropHere')}</p>
            </motion.div>
          ) : (
            items.map((group) => (
              <KanbanCard
                key={group.id}
                id={group.id}
                name={group.name}
                members={group.members}
                contribution={group.contribution}
                frequency={group.frequency}
                nextDue={group.nextDue}
                status={group.status}
                formatContribution={formatContribution}
                onClick={() => onCardClick(group.id)}
                onWhatsAppClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppClick(group);
                }}
                isFavorite={favoriteGroups.includes(String(group.id))}
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(group.id);
                }}
                onShareViaQRCode={(e) => {
                  e.stopPropagation();
                  onShareViaQRCode(group);
                }}
                tags={group.tags}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
