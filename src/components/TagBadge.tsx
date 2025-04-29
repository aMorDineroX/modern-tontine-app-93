import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface TagBadgeProps {
  tag: string;
  color?: string;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const colorMap: Record<string, { bg: string, text: string, bgDark: string, textDark: string }> = {
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    bgDark: 'dark:bg-green-900/30',
    textDark: 'dark:text-green-300'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    bgDark: 'dark:bg-blue-900/30',
    textDark: 'dark:text-blue-300'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    bgDark: 'dark:bg-red-900/30',
    textDark: 'dark:text-red-300'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    bgDark: 'dark:bg-yellow-900/30',
    textDark: 'dark:text-yellow-300'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    bgDark: 'dark:bg-purple-900/30',
    textDark: 'dark:text-purple-300'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    bgDark: 'dark:bg-pink-900/30',
    textDark: 'dark:text-pink-300'
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    bgDark: 'dark:bg-indigo-900/30',
    textDark: 'dark:text-indigo-300'
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    bgDark: 'dark:bg-gray-700',
    textDark: 'dark:text-gray-300'
  }
};

// Fonction pour générer une couleur cohérente basée sur le texte du tag
const getColorFromTag = (tag: string): string => {
  const colors = Object.keys(colorMap).filter(color => color !== 'gray');
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function TagBadge({ 
  tag, 
  color, 
  onRemove, 
  onClick,
  selected = false,
  className = ''
}: TagBadgeProps) {
  // Déterminer la couleur à utiliser
  const tagColor = color || getColorFromTag(tag);
  const { bg, text, bgDark, textDark } = colorMap[tagColor] || colorMap.gray;
  
  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} ${bgDark} ${textDark} ${
        selected ? 'ring-2 ring-offset-1 ring-primary' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          className="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Supprimer le tag ${tag}`}
        >
          <X size={10} />
        </button>
      )}
    </motion.span>
  );
}
