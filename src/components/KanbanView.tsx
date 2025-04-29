import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import { Group } from '@/types/group';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface KanbanViewProps {
  groups: Group[];
  onGroupStatusChange: (groupId: string | number, newStatus: "active" | "pending" | "completed") => void;
  formatContribution: (amount: number, frequency: string) => string;
  onCardClick: (groupId: string | number) => void;
  onWhatsAppClick: (group: Group) => void;
}

export default function KanbanView({
  groups,
  onGroupStatusChange,
  formatContribution,
  onCardClick,
  onWhatsAppClick
}: KanbanViewProps) {
  const { t } = useApp();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | number | null>(null);
  
  // Configurer les capteurs pour le glisser-déposer
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Activer le glisser-déposer après un déplacement de 8px
      },
    })
  );
  
  // Filtrer les groupes par statut
  const activeGroups = groups.filter(group => group.status === 'active');
  const pendingGroups = groups.filter(group => group.status === 'pending');
  const completedGroups = groups.filter(group => group.status === 'completed');
  
  // Gérer le début du glisser-déposer
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };
  
  // Gérer la fin du glisser-déposer
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // Si l'élément est déposé sur une colonne
    if (over.data.current?.status && active.id !== over.id) {
      const newStatus = over.data.current.status as "active" | "pending" | "completed";
      const groupId = active.id;
      
      // Appeler la fonction de changement de statut
      onGroupStatusChange(groupId, newStatus);
      
      // Afficher une notification
      toast({
        title: t('statusUpdated'),
        description: `${t('groupStatus')} ${t(newStatus)}`,
      });
    }
    
    setActiveId(null);
  };
  
  // Gérer le survol pendant le glisser-déposer
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Si l'élément est déplacé dans la même colonne, réorganiser
    if (active.id !== over.id && !over.data.current?.status) {
      const activeIndex = groups.findIndex(g => g.id === active.id);
      const overIndex = groups.findIndex(g => g.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        // Réorganiser les groupes (cette logique serait normalement gérée par le parent)
        // Dans une implémentation réelle, vous appelleriez une fonction de mise à jour
      }
    }
  };
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <motion.div 
        className="flex gap-4 min-w-full pb-4 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Colonne Active */}
        <KanbanColumn
          id="active"
          title={t('active')}
          items={activeGroups}
          color="bg-green-500"
          borderColor="border-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
          textColor="text-green-700 dark:text-green-300"
          formatContribution={formatContribution}
          onCardClick={onCardClick}
          onWhatsAppClick={onWhatsAppClick}
        />
        
        {/* Colonne En attente */}
        <KanbanColumn
          id="pending"
          title={t('pending')}
          items={pendingGroups}
          color="bg-yellow-500"
          borderColor="border-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          textColor="text-yellow-700 dark:text-yellow-300"
          formatContribution={formatContribution}
          onCardClick={onCardClick}
          onWhatsAppClick={onWhatsAppClick}
        />
        
        {/* Colonne Terminé */}
        <KanbanColumn
          id="completed"
          title={t('completed')}
          items={completedGroups}
          color="bg-blue-500"
          borderColor="border-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          textColor="text-blue-700 dark:text-blue-300"
          formatContribution={formatContribution}
          onCardClick={onCardClick}
          onWhatsAppClick={onWhatsAppClick}
        />
      </motion.div>
    </DndContext>
  );
}
