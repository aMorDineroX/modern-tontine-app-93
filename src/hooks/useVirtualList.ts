import { useRef, useState, useEffect, useMemo } from 'react';

/**
 * Options pour le hook useVirtualList
 */
interface UseVirtualListOptions {
  /** Hauteur de chaque élément en pixels */
  itemHeight: number;
  /** Nombre d'éléments à afficher avant et après la zone visible */
  overscan?: number;
}

/**
 * Hook personnalisé pour créer une liste virtualisée
 * 
 * @param {Array} items - Liste des éléments à afficher
 * @param {UseVirtualListOptions} options - Options de configuration
 * @returns {Object} Propriétés et méthodes pour la liste virtualisée
 * 
 * @example
 * const { virtualItems, containerProps, itemProps } = useVirtualList(
 *   myLongList,
 *   { itemHeight: 50 }
 * );
 * 
 * return (
 *   <div {...containerProps}>
 *     <div style={{ height: totalHeight }}>
 *       {virtualItems.map(({ index, offsetTop }) => (
 *         <div
 *           key={index}
 *           {...itemProps(index, offsetTop)}
 *         >
 *           {myLongList[index]}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 */
export function useVirtualList<T>(items: T[], options: UseVirtualListOptions) {
  const { itemHeight, overscan = 3 } = options;
  
  // Référence au conteneur
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // État pour le scroll
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Calculer la hauteur totale de la liste
  const totalHeight = items.length * itemHeight;
  
  // Gérer le scroll
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };
  
  // Observer les dimensions du conteneur
  useEffect(() => {
    if (!containerRef.current) return;
    
    setContainerHeight(containerRef.current.clientHeight);
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Calculer les éléments visibles
  const virtualItems = useMemo(() => {
    if (!containerHeight) return [];
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleItems = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }
    
    return visibleItems;
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);
  
  // Props pour le conteneur
  const containerProps = {
    ref: containerRef,
    onScroll: handleScroll,
    style: {
      height: '100%',
      overflow: 'auto',
      position: 'relative' as const,
    }
  };
  
  // Fonction pour générer les props des éléments
  const itemProps = (index: number, offsetTop: number) => ({
    style: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: `${itemHeight}px`,
      transform: `translateY(${offsetTop}px)`,
    }
  });
  
  return {
    virtualItems,
    totalHeight,
    containerProps,
    itemProps,
  };
}
