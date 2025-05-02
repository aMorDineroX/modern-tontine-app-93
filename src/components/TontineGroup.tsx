import React, { useRef, useEffect } from 'react';
import { Users, Calendar, Clock, Coins, Tag, Star, StarOff, MessageSquare, QrCode, ArrowUpRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import TagBadge from './TagBadge';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';

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
  /** ID du groupe */
  id?: string | number;
  /** Indique si le groupe est en favori */
  isFavorite?: boolean;
  /** Fonction pour basculer l'état favori */
  onToggleFavorite?: (e: React.MouseEvent) => void;
  /** Fonction pour ouvrir WhatsApp */
  onWhatsAppClick?: (e: React.MouseEvent) => void;
  /** Fonction pour partager via QR code */
  onShareViaQRCode?: (e: React.MouseEvent) => void;
  /** Classe CSS personnalisée */
  className?: string;
  /** Style d'affichage */
  variant?: 'default' | 'modern' | 'minimal';
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
  compact = false,
  id,
  isFavorite = false,
  onToggleFavorite,
  onWhatsAppClick,
  onShareViaQRCode,
  className = '',
  variant = 'default'
}: TontineGroupProps) {
  // Access accessibility context
  const { announce, reducedMotion } = useAccessibility();

  // Create a unique ID for this component
  const uniqueId = React.useId();

  // Reference to the main button element
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  // Fonction pour générer les classes CSS en fonction du variant
  const getCardClasses = () => {
    switch (variant) {
      case 'modern':
        return 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-0';
      case 'minimal':
        return 'bg-transparent border border-gray-200 dark:border-gray-700 shadow-none hover:bg-gray-50 dark:hover:bg-gray-800';
      default:
        return '';
    }
  };

  // Fonction pour gérer le clic sur le bouton favori
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(e);
  };

  // Fonction pour gérer le clic sur le bouton WhatsApp
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsAppClick) onWhatsAppClick(e);
  };

  // Fonction pour gérer le clic sur le bouton QR Code
  const handleQRCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareViaQRCode) onShareViaQRCode(e);
  };

  // Déterminer les animations en fonction du variant et des préférences d'accessibilité
  const getAnimations = () => {
    // If reduced motion is enabled, use minimal animations
    if (reducedMotion) {
      return {
        whileHover: { backgroundColor: 'rgba(0, 0, 0, 0.02)', transition: { duration: 0.05 } },
        whileTap: { scale: 0.99 }
      };
    }

    // Otherwise, use the variant-specific animations
    switch (variant) {
      case 'modern':
        return {
          whileHover: { y: -6, scale: 1.02, transition: { duration: 0.2 } },
          whileTap: { scale: 0.98 }
        };
      case 'minimal':
        return {
          whileHover: { backgroundColor: 'rgba(0, 0, 0, 0.02)', transition: { duration: 0.2 } },
          whileTap: { scale: 0.98 }
        };
      default:
        return {
          whileHover: { y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", transition: { duration: 0.2 } }
        };
    }
  };

  const animations = getAnimations();

  // Announce group details to screen readers when focused
  const handleFocus = () => {
    const statusText = status === 'active' ? 'actif' : status === 'pending' ? 'en attente' : 'terminé';
    announce(
      `Groupe ${name}, ${members} membres, contribution: ${contribution}, prochaine échéance: ${nextDue}, statut: ${statusText}${progress > 0 ? `, progression: ${progress}%` : ''}`
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter or Space to activate the card
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        `tontine-card w-full text-left transition-all hover:shadow-md cursor-pointer ${
          compact ? 'p-3' : 'p-4'
        } h-full flex flex-col`,
        getCardClasses(),
        className
      )}
      aria-label={`Groupe ${name}`}
      aria-describedby={`${uniqueId}-description`}
      aria-roledescription="Carte de groupe tontine"
      role="article"
      tabIndex={0}
      {...animations}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
    >
      {/* Hidden description for screen readers */}
      <span id={`${uniqueId}-description`} className="sr-only">
        {`Groupe ${name} avec ${members} membres, contribution: ${contribution}, prochaine échéance: ${nextDue}, statut: ${status}${progress > 0 ? `, progression: ${progress}%` : ''}`}
      </span>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-lg truncate dark:text-white">{name}</h3>
          {isFavorite && (
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
          )}
        </div>
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
              <span id={`${uniqueId}-progress-label`}>Progression du cycle</span>
              <span aria-hidden="true">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              aria-labelledby={`${uniqueId}-progress-label`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
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

        {/* Actions rapides */}
        <div
          className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-700"
          role="toolbar"
          aria-label="Actions rapides"
        >
          <div className="flex space-x-1">
            {onToggleFavorite && (
              <motion.button
                onClick={handleFavoriteClick}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-pressed={isFavorite}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: reducedMotion ? 0.98 : 0.95 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavoriteClick(e as unknown as React.MouseEvent);
                  }
                }}
              >
                {isFavorite ? (
                  <StarOff size={18} className="text-yellow-500" aria-hidden="true" />
                ) : (
                  <Star size={18} className="text-gray-400 hover:text-yellow-500" aria-hidden="true" />
                )}
              </motion.button>
            )}

            {onWhatsAppClick && (
              <motion.button
                onClick={handleWhatsAppClick}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Ouvrir dans WhatsApp"
                title="Ouvrir dans WhatsApp"
                whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: reducedMotion ? 0.98 : 0.95 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWhatsAppClick(e as unknown as React.MouseEvent);
                  }
                }}
              >
                <MessageSquare size={18} className="text-green-600" aria-hidden="true" />
              </motion.button>
            )}

            {onShareViaQRCode && (
              <motion.button
                onClick={handleQRCodeClick}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Partager via QR Code"
                title="Partager via QR Code"
                whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: reducedMotion ? 0.98 : 0.95 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQRCodeClick(e as unknown as React.MouseEvent);
                  }
                }}
              >
                <QrCode size={18} className="text-blue-600" aria-hidden="true" />
              </motion.button>
            )}
          </div>

          <motion.button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Voir les détails"
            title="Voir les détails"
            whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: reducedMotion ? 0.98 : 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }
            }}
          >
            <ArrowUpRight size={18} className="text-primary" aria-hidden="true" />
          </motion.button>
        </div>

        {actions.length > 0 && (
          <div
            className="flex justify-end space-x-2 mt-2"
            role="toolbar"
            aria-label="Actions supplémentaires"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                onClick={(e) => handleActionClick(e, action)}
                className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={action.label}
                title={action.label}
                whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: reducedMotion ? 0.98 : 0.95 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleActionClick(e as unknown as React.MouseEvent, action);
                  }
                }}
              >
                {React.isValidElement(action.icon)
                  ? React.cloneElement(action.icon as React.ReactElement, { 'aria-hidden': 'true' })
                  : action.icon
                }
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
});

export default TontineGroup;
