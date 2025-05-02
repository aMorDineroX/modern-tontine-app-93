import React, { useState, useRef, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { motion } from 'framer-motion';

// Context for accordion state
interface AccordionContextType {
  /** Currently expanded item */
  expandedItem: string | null;
  /** Function to toggle an item */
  toggleItem: (itemId: string) => void;
  /** Whether multiple items can be expanded */
  allowMultiple: boolean;
  /** Currently expanded items (for multiple mode) */
  expandedItems: string[];
  /** Whether to announce changes to screen readers */
  announceChanges: boolean;
  /** Whether animations are reduced */
  reducedMotion: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccessibleAccordionProps {
  /** Child accordion items */
  children: React.ReactNode;
  /** Default expanded item ID */
  defaultExpanded?: string;
  /** Default expanded item IDs (for multiple mode) */
  defaultExpandedItems?: string[];
  /** Whether multiple items can be expanded */
  allowMultiple?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to announce changes to screen readers */
  announceChanges?: boolean;
  /** ID for the accordion */
  id?: string;
}

/**
 * AccessibleAccordion component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleAccordion>
 *   <AccessibleAccordionItem title="Section 1">
 *     Content for section 1
 *   </AccessibleAccordionItem>
 *   <AccessibleAccordionItem title="Section 2">
 *     Content for section 2
 *   </AccessibleAccordionItem>
 * </AccessibleAccordion>
 */
export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  children,
  defaultExpanded,
  defaultExpandedItems = [],
  allowMultiple = false,
  className = '',
  announceChanges = true,
  id,
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(defaultExpanded || null);
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedItems);
  const { reducedMotion } = useAccessibility();
  
  // Generate a unique ID for the accordion
  const uniqueId = id || `accordion-${React.useId()}`;
  
  // Toggle an accordion item
  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setExpandedItems(prev => 
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setExpandedItem(prev => prev === itemId ? null : itemId);
    }
  };
  
  return (
    <AccordionContext.Provider
      value={{
        expandedItem,
        toggleItem,
        allowMultiple,
        expandedItems,
        announceChanges,
        reducedMotion,
      }}
    >
      <div
        className={cn('space-y-2', className)}
        id={uniqueId}
        role="presentation"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccessibleAccordionItemProps {
  /** Title of the accordion item */
  title: React.ReactNode;
  /** Content of the accordion item */
  children: React.ReactNode;
  /** ID for the accordion item */
  id?: string;
  /** Whether the accordion item is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the accordion item */
  className?: string;
  /** Additional CSS classes for the accordion button */
  buttonClassName?: string;
  /** Additional CSS classes for the accordion content */
  contentClassName?: string;
  /** Icon to display next to the title */
  icon?: React.ReactNode;
  /** Custom expand/collapse icon */
  expandIcon?: React.ReactNode;
  /** Description for screen readers */
  description?: string;
}

/**
 * AccessibleAccordionItem component
 * 
 * @component
 * @example
 * <AccessibleAccordionItem title="Section 1">
 *   Content for section 1
 * </AccessibleAccordionItem>
 */
export const AccessibleAccordionItem: React.FC<AccessibleAccordionItemProps> = ({
  title,
  children,
  id,
  disabled = false,
  className = '',
  buttonClassName = '',
  contentClassName = '',
  icon,
  expandIcon,
  description,
}) => {
  const context = useContext(AccordionContext);
  
  if (!context) {
    throw new Error('AccessibleAccordionItem must be used within an AccessibleAccordion');
  }
  
  const { 
    expandedItem, 
    toggleItem, 
    allowMultiple, 
    expandedItems, 
    announceChanges,
    reducedMotion,
  } = context;
  
  const { announce } = useAccessibility();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique ID for the accordion item
  const uniqueId = id || `accordion-item-${React.useId()}`;
  const headerId = `${uniqueId}-header`;
  const contentId = `${uniqueId}-content`;
  
  // Check if the item is expanded
  const isExpanded = allowMultiple
    ? expandedItems.includes(uniqueId)
    : expandedItem === uniqueId;
  
  // Handle button click
  const handleClick = () => {
    if (disabled) return;
    
    toggleItem(uniqueId);
    
    // Announce state change
    if (announceChanges) {
      const titleText = typeof title === 'string' ? title : 'Section';
      const message = isExpanded
        ? `${titleText} collapsed`
        : `${titleText} expanded`;
      
      announce(message);
    }
  };
  
  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <h3>
        <button
          id={headerId}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-disabled={disabled}
          className={cn(
            'flex items-center justify-between w-full px-4 py-3 text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isExpanded ? 'bg-muted' : 'bg-transparent hover:bg-muted/50',
            buttonClassName
          )}
          onClick={handleClick}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{title}</span>
          </div>
          {expandIcon || (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )}
              aria-hidden="true"
            />
          )}
        </button>
      </h3>
      
      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isExpanded}
        initial={false}
        animate={isExpanded ? 'open' : 'closed'}
        variants={{
          open: { height: 'auto', opacity: 1 },
          closed: { height: 0, opacity: 0 }
        }}
        transition={{ 
          duration: reducedMotion ? 0.01 : 0.2,
          ease: 'easeInOut'
        }}
        className={cn(
          'overflow-hidden',
          contentClassName
        )}
      >
        <div 
          ref={contentRef}
          className="px-4 py-3"
        >
          {children}
        </div>
        
        {description && (
          <div className="sr-only">{description}</div>
        )}
      </motion.div>
    </div>
  );
};

export default AccessibleAccordion;
