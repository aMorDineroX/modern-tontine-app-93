import React from 'react';

/**
 * Interface des propriétés du composant LoadingScreen
 */
interface LoadingScreenProps {
  /** Message à afficher pendant le chargement */
  message?: string;
}

/**
 * Composant LoadingScreen - Affiche un écran de chargement
 * 
 * @component
 * @example
 * <LoadingScreen message="Chargement en cours..." />
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement..." 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);
