import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, StarOff, QrCode, Users, Calendar, Coins } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '@/contexts/AppContext';
import TagBadge from './TagBadge';

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
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onShareViaQRCode?: (e: React.MouseEvent) => void;
  tags?: string[];
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
  onWhatsAppClick,
  isFavorite = false,
  onToggleFavorite,
  onShareViaQRCode,
  tags = []
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
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing"
      onClick={onClick}
      data-group-id={id}
      data-group-status={status}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-1 max-w-[70%]">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{name}</h4>
          {isFavorite && (
            <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <Users size={12} className="mr-1 text-primary" />
          <span className="truncate">{members} {t('members')}</span>
        </div>

        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <Calendar size={12} className="mr-1 text-primary" />
          <span className="truncate">{nextDue}</span>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2 bg-primary/10 p-1.5 rounded">
        <Coins size={12} className="mr-1 text-primary" />
        <span className="truncate font-medium text-primary">
          {formatContribution(contribution, frequency)}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.slice(0, 2).map((tag, index) => (
            <TagBadge
              key={index}
              tag={tag}
              className="text-[9px] px-1 py-0"
            />
          ))}
          {tags.length > 2 && (
            <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1 py-0 rounded">
              +{tags.length - 2}
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex space-x-1">
          {onToggleFavorite && (
            <button
              className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(e);
              }}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isFavorite ? (
                <StarOff size={14} className="text-yellow-500" />
              ) : (
                <Star size={14} />
              )}
            </button>
          )}

          {onWhatsAppClick && (
            <button
              className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onWhatsAppClick(e);
              }}
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <MessageSquare size={14} />
            </button>
          )}

          {onShareViaQRCode && (
            <button
              className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                if (onShareViaQRCode) onShareViaQRCode(e);
              }}
              aria-label="QR Code"
              title="Partager via QR Code"
            >
              <QrCode size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
