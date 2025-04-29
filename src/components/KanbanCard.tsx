import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '@/contexts/AppContext';

interface KanbanCardProps {
  id: string | number;
  name: string;
  members: number;
  contribution: number;
  frequency: string;
  nextDue: string;
  status: "active" | "pending" | "completed";
  formatContribution: (amount: number, frequency: string) => string;
  onClick: () => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
}

export default function KanbanCard({
  id,
  name,
  members,
  contribution,
  frequency,
  nextDue,
  status,
  formatContribution,
  onClick,
  onWhatsAppClick
}: KanbanCardProps) {
  const { t } = useApp();
  
  // Configuration du glisser-déposer avec dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };
  
  // Obtenir la couleur de fond en fonction du statut
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-grab active:cursor-grabbing"
      onClick={onClick}
      data-group-id={id}
      data-group-status={status}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-[70%]">{name}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
          {members} {t('members')}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {formatContribution(contribution, frequency)}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span className="truncate max-w-[70%]">{t('nextDue')}: {nextDue}</span>
        <button 
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onWhatsAppClick(e);
          }}
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <MessageSquare size={14} />
        </button>
      </div>
    </motion.div>
  );
}
