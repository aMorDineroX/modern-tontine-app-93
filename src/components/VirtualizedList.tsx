import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * Composant pour afficher une liste virtualisée
 * 
 * @component
 * @template T - Type des éléments de la liste
 * @param {VirtualizedListProps<T>} props - Propriétés du composant
 * @returns {JSX.Element} Composant VirtualizedList
 */
function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isEndReached, setIsEndReached] = useState(false);
  
  // Calculer les indices des éléments visibles
  const visibleItemCount = Math.ceil(height / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );
  
  // Gérer le défilement
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      setScrollTop(scrollTop);
      
      // Vérifier si on a atteint la fin de la liste
      if (onEndReached && !isEndReached) {
        const scrollHeight = containerRef.current.scrollHeight;
        const scrollPosition = scrollTop + height;
        const threshold = scrollHeight * endReachedThreshold;
        
        if (scrollPosition >= threshold) {
          setIsEndReached(true);
          onEndReached();
        }
      }
    }
  }, [height, onEndReached, isEndReached, endReachedThreshold]);
  
  // Réinitialiser isEndReached lorsque les éléments changent
  useEffect(() => {
    setIsEndReached(false);
  }, [items]);
  
  // Ajouter l'écouteur d'événement de défilement
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  // Générer les éléments visibles
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: `${i * itemHeight}px`,
          height: `${itemHeight}px`,
          width: '100%'
        }}
      >
        {renderItem(items[i], i)}
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative'
      }}
      className={className}
      role="list"
      aria-label="Liste virtualisée"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualizedList;
