import React, { useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import TontineGroup from '@/components/TontineGroup';
import { Group } from '@/types/group';
import { useInView } from 'react-intersection-observer';

interface VirtualizedGroupListProps {
  groups: Group[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  formatContribution: (amount: number, frequency: string) => string;
  onGroupClick: (groupId: string | number) => void;
  onWhatsAppClick?: (group: Group) => void;
  onToggleFavorite?: (groupId: string | number) => void;
  onShareViaQRCode?: (group: Group) => void;
  favoriteGroups: string[];
  view: 'grid' | 'list';
}

/**
 * Virtualized list component for displaying groups with efficient rendering
 * 
 * @component
 * @param {VirtualizedGroupListProps} props - Component props
 * @returns {JSX.Element} Virtualized group list component
 */
const VirtualizedGroupList: React.FC<VirtualizedGroupListProps> = ({
  groups,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  formatContribution,
  onGroupClick,
  onWhatsAppClick,
  onToggleFavorite,
  onShareViaQRCode,
  favoriteGroups,
  view
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer for infinite loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  
  // Fetch next page when the load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Set up virtualizer
  const rowVirtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => view === 'list' ? 100 : 300,
    overscan: 5,
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // Render a group item
  const renderGroupItem = useCallback((group: Group, index: number) => {
    return (
      <motion.div
        key={group.id}
        variants={itemVariants}
        className={view === 'list' ? 'mb-2' : ''}
      >
        <TontineGroup
          id={group.id}
          name={group.name}
          members={group.members}
          contribution={formatContribution(group.contribution, group.frequency)}
          nextDue={group.nextDue}
          status={group.status}
          progress={group.progress}
          tags={group.tags}
          onClick={() => onGroupClick(group.id)}
          isFavorite={favoriteGroups.includes(String(group.id))}
          onToggleFavorite={onToggleFavorite ? (e) => {
            e.stopPropagation();
            onToggleFavorite(group.id);
          } : undefined}
          onWhatsAppClick={onWhatsAppClick ? (e) => {
            e.stopPropagation();
            onWhatsAppClick(group);
          } : undefined}
          onShareViaQRCode={onShareViaQRCode ? (e) => {
            e.stopPropagation();
            onShareViaQRCode(group);
          } : undefined}
          variant={view === 'list' ? 'minimal' : 'modern'}
          compact={view === 'list'}
          className={view === 'list' ? 'mb-2' : 'h-full'}
        />
      </motion.div>
    );
  }, [view, formatContribution, onGroupClick, favoriteGroups, onToggleFavorite, onWhatsAppClick, onShareViaQRCode]);
  
  if (isLoading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des groupes...</span>
      </div>
    );
  }
  
  return (
    <div 
      ref={parentRef} 
      className="w-full overflow-auto"
      style={{ 
        height: view === 'list' ? '70vh' : '75vh',
        position: 'relative'
      }}
      aria-label="Liste des groupes"
      role="list"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const group = groups[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
            >
              {renderGroupItem(group, virtualRow.index)}
            </div>
          );
        })}
      </motion.div>
      
      {/* Load more indicator */}
      {hasNextPage && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center items-center py-4"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualizedGroupList;
