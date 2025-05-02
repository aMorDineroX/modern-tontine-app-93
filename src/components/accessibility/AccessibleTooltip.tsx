import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibleTooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Child element that triggers the tooltip */
  children: React.ReactElement;
  /** Delay before showing the tooltip (in ms) */
  delayShow?: number;
  /** Delay before hiding the tooltip (in ms) */
  delayHide?: number;
  /** Position of the tooltip */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Whether to show an arrow */
  showArrow?: boolean;
  /** Additional CSS classes for the tooltip */
  className?: string;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** ID for the tooltip */
  id?: string;
  /** Whether to announce the tooltip to screen readers */
  announceToScreenReader?: boolean;
  /** Whether to show the tooltip on focus */
  showOnFocus?: boolean;
  /** Whether to persist the tooltip when clicked */
  persistOnClick?: boolean;
  /** Maximum width of the tooltip */
  maxWidth?: number | string;
}

/**
 * AccessibleTooltip component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleTooltip content="This is a tooltip">
 *   <Button>Hover me</Button>
 * </AccessibleTooltip>
 */
const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  children,
  delayShow = 300,
  delayHide = 200,
  position = 'top',
  showArrow = true,
  className = '',
  disabled = false,
  id,
  announceToScreenReader = true,
  showOnFocus = true,
  persistOnClick = false,
  maxWidth = 250,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { announce, reducedMotion } = useAccessibility();
  
  // Generate a unique ID for the tooltip
  const uniqueId = id || `tooltip-${React.useId()}`;
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  
  // Position the tooltip
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;
    
    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8 + scrollY;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
          left = triggerRect.right + 8 + scrollX;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8 + scrollY;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
          left = triggerRect.left - tooltipRect.width - 8 + scrollX;
          break;
      }
      
      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position
      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }
      
      // Adjust vertical position
      if (top < 10) {
        top = 10;
      } else if (top + tooltipRect.height > viewportHeight - 10) {
        top = viewportHeight - tooltipRect.height - 10;
      }
      
      tooltipRef.current!.style.top = `${top}px`;
      tooltipRef.current!.style.left = `${left}px`;
    };
    
    updatePosition();
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);
  
  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    // Clear any existing timeouts
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Set timeout to show tooltip
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      
      // Announce tooltip content to screen readers
      if (announceToScreenReader && typeof content === 'string') {
        announce(content);
      }
    }, delayShow);
  };
  
  // Hide tooltip
  const hideTooltip = () => {
    if (disabled || isPersistent) return;
    
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    // Set timeout to hide tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  };
  
  // Handle click on trigger
  const handleClick = (e: React.MouseEvent) => {
    // Call the original onClick handler if it exists
    if (children.props.onClick) {
      children.props.onClick(e);
    }
    
    if (persistOnClick) {
      setIsPersistent(prev => !prev);
      setIsVisible(true);
    }
  };
  
  // Handle key down on trigger
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Call the original onKeyDown handler if it exists
    if (children.props.onKeyDown) {
      children.props.onKeyDown(e);
    }
    
    // Toggle persistent tooltip on Enter or Space
    if (persistOnClick && (e.key === 'Enter' || e.key === ' ')) {
      setIsPersistent(prev => !prev);
      setIsVisible(true);
    }
    
    // Hide tooltip on Escape
    if (e.key === 'Escape' && isVisible) {
      setIsPersistent(false);
      setIsVisible(false);
    }
  };
  
  // Handle click outside
  useEffect(() => {
    if (!isPersistent) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsPersistent(false);
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPersistent]);
  
  // Clone the child element to add event handlers
  const triggerElement = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      // Merge refs
      triggerRef.current = node;
      
      // Call the original ref if it exists
      const { ref } = children;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement>).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      
      // Call the original onMouseEnter handler if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      
      // Call the original onMouseLeave handler if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      if (showOnFocus) {
        showTooltip();
      }
      
      // Call the original onFocus handler if it exists
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      if (showOnFocus) {
        hideTooltip();
      }
      
      // Call the original onBlur handler if it exists
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    'aria-describedby': isVisible ? uniqueId : undefined,
  });
  
  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: reducedMotion ? 0.01 : 0.15,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.15,
      },
    },
  };
  
  // Get arrow position styles
  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderTop: 'none',
          borderLeft: 'none',
        };
      case 'right':
        return {
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderTop: 'none',
          borderRight: 'none',
        };
      case 'bottom':
        return {
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderBottom: 'none',
          borderRight: 'none',
        };
      case 'left':
        return {
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderBottom: 'none',
          borderLeft: 'none',
        };
    }
  };
  
  return (
    <>
      {triggerElement}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            id={uniqueId}
            role="tooltip"
            className={cn(
              'fixed z-50 px-3 py-1.5 text-sm rounded-md shadow-md',
              'bg-popover text-popover-foreground border border-border',
              className
            )}
            style={{
              maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
          >
            {content}
            
            {showArrow && (
              <div
                className="absolute w-2 h-2 bg-popover border border-border"
                style={getArrowStyles()}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibleTooltip;
