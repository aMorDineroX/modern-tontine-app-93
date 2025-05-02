import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Child elements */
  children: React.ReactNode;
  /** Initial element to focus when trap is activated */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Whether to restore focus to the previously focused element when trap is deactivated */
  restoreFocus?: boolean;
  /** Whether to auto-focus the first focusable element when trap is activated */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to include the root element in the tab order */
  includeRoot?: boolean;
}

/**
 * FocusTrap component for trapping focus within a container
 * 
 * @component
 * @example
 * <FocusTrap active={isOpen}>
 *   <div>
 *     <button>Button 1</button>
 *     <button>Button 2</button>
 *   </div>
 * </FocusTrap>
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  children,
  initialFocus,
  restoreFocus = true,
  autoFocus = true,
  className = '',
  includeRoot = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Store the previously focused element when the trap is activated
  useEffect(() => {
    if (active && restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active, restoreFocus]);
  
  // Set focus to the initial element or the first focusable element when the trap is activated
  useEffect(() => {
    if (!active || !rootRef.current) return;
    
    // Set initial focus
    if (initialFocus && initialFocus.current) {
      initialFocus.current.focus();
    } else if (autoFocus) {
      // Find all focusable elements
      const focusableElements = rootRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (includeRoot && rootRef.current) {
        rootRef.current.focus();
      }
    }
    
    return () => {
      // Restore focus when the trap is deactivated
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, autoFocus, restoreFocus, includeRoot]);
  
  // Handle tab key to trap focus within the container
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active || !rootRef.current || event.key !== 'Tab') return;
    
    // Find all focusable elements
    const focusableElements = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    
    if (focusableElements.length === 0) return;
    
    // Add the root element to the focusable elements if includeRoot is true
    if (includeRoot && rootRef.current.tabIndex !== -1) {
      focusableElements.unshift(rootRef.current);
    }
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab on the first element, move to the last element
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // If tab on the last element, move to the first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
  
  return (
    <div
      ref={rootRef}
      className={className}
      tabIndex={includeRoot ? 0 : -1}
      onKeyDown={handleKeyDown}
      aria-modal={active ? 'true' : undefined}
      role={active ? 'dialog' : undefined}
    >
      {children}
    </div>
  );
};

export default FocusTrap;
