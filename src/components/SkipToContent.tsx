import React from 'react';

/**
 * Interface des propriétés du composant SkipToContent
 */
interface SkipToContentProps {
  /** ID de l'élément de contenu principal */
  contentId: string;
  /** Texte du lien */
  label?: string;
}

/**
 * Composant SkipToContent - Permet aux utilisateurs de clavier de sauter la navigation
 * et d'aller directement au contenu principal
 * 
 * @component
 * @example
 * <SkipToContent contentId="main-content" />
 * ...
 * <main id="main-content">
 *   Contenu principal
 * </main>
 */
const SkipToContent: React.FC<SkipToContentProps> = ({
  contentId,
  label = "Aller au contenu principal"
}) => {
  return (
    <a
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:shadow-lg"
    >
      {label}
    </a>
  );
};

export default SkipToContent;
