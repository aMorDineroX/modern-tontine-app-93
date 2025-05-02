import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface FocusManagerContextType {
  /** Set focus to a specific element */
  setFocus: (elementId: string) => void;
  /** Register a focusable element */
  registerFocusable: (elementId: string, ref: React.RefObject<HTMLElement>) => void;
  /** Unregister a focusable element */
  unregisterFocusable: (elementId: string) => void;
  /** Get the currently focused element ID */
  currentFocus: string | null;
  /** Move focus to the next focusable element */
  focusNext: () => void;
  /** Move focus to the previous focusable element */
  focusPrevious: () => void;
  /** Move focus to the first focusable element */
  focusFirst: () => void;
  /** Move focus to the last focusable element */
  focusLast: () => void;
}

const FocusManagerContext = createContext<FocusManagerContextType | undefined>(undefined);

/**
 * Provider component for focus management
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} FocusManagerProvider component
 */
export const FocusManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const focusableElements = useRef<Map<string, React.RefObject<HTMLElement>>>(new Map());
  
  // Register a focusable element
  const registerFocusable = useCallback((elementId: string, ref: React.RefObject<HTMLElement>) => {
    focusableElements.current.set(elementId, ref);
  }, []);
  
  // Unregister a focusable element
  const unregisterFocusable = useCallback((elementId: string) => {
    focusableElements.current.delete(elementId);
    
    // If the current focus is the element being unregistered, clear it
    if (currentFocus === elementId) {
      setCurrentFocus(null);
    }
  }, [currentFocus]);
  
  // Set focus to a specific element
  const setFocus = useCallback((elementId: string) => {
    const ref = focusableElements.current.get(elementId);
    
    if (ref && ref.current) {
      ref.current.focus();
      setCurrentFocus(elementId);
    }
  }, []);
  
  // Get all focusable element IDs in order
  const getFocusableIds = useCallback(() => {
    return Array.from(focusableElements.current.keys());
  }, []);
  
  // Move focus to the next focusable element
  const focusNext = useCallback(() => {
    const ids = getFocusableIds();
    
    if (ids.length === 0) return;
    
    if (!currentFocus) {
      setFocus(ids[0]);
      return;
    }
    
    const currentIndex = ids.indexOf(currentFocus);
    const nextIndex = (currentIndex + 1) % ids.length;
    
    setFocus(ids[nextIndex]);
  }, [currentFocus, getFocusableIds, setFocus]);
  
  // Move focus to the previous focusable element
  const focusPrevious = useCallback(() => {
    const ids = getFocusableIds();
    
    if (ids.length === 0) return;
    
    if (!currentFocus) {
      setFocus(ids[ids.length - 1]);
      return;
    }
    
    const currentIndex = ids.indexOf(currentFocus);
    const previousIndex = (currentIndex - 1 + ids.length) % ids.length;
    
    setFocus(ids[previousIndex]);
  }, [currentFocus, getFocusableIds, setFocus]);
  
  // Move focus to the first focusable element
  const focusFirst = useCallback(() => {
    const ids = getFocusableIds();
    
    if (ids.length > 0) {
      setFocus(ids[0]);
    }
  }, [getFocusableIds, setFocus]);
  
  // Move focus to the last focusable element
  const focusLast = useCallback(() => {
    const ids = getFocusableIds();
    
    if (ids.length > 0) {
      setFocus(ids[ids.length - 1]);
    }
  }, [getFocusableIds, setFocus]);
  
  // Track focus changes in the document
  useEffect(() => {
    const handleFocusChange = () => {
      // Find the element ID that matches the currently focused element
      for (const [id, ref] of focusableElements.current.entries()) {
        if (ref.current === document.activeElement) {
          setCurrentFocus(id);
          return;
        }
      }
      
      // If no match is found, clear the current focus
      setCurrentFocus(null);
    };
    
    document.addEventListener('focusin', handleFocusChange);
    
    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, []);
  
  const value: FocusManagerContextType = {
    setFocus,
    registerFocusable,
    unregisterFocusable,
    currentFocus,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
  
  return (
    <FocusManagerContext.Provider value={value}>
      {children}
    </FocusManagerContext.Provider>
  );
};

/**
 * Hook to use focus management
 * 
 * @returns {FocusManagerContextType} Focus manager context
 */
export const useFocusManager = (): FocusManagerContextType => {
  const context = useContext(FocusManagerContext);
  
  if (context === undefined) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  
  return context;
};

/**
 * Component to make an element focusable by the focus manager
 * 
 * @component
 * @example
 * <Focusable id="my-button">
 *   <button>Click me</button>
 * </Focusable>
 */
export const Focusable: React.FC<{
  id: string;
  children: React.ReactElement;
  autoFocus?: boolean;
}> = ({ id, children, autoFocus = false }) => {
  const ref = useRef<HTMLElement>(null);
  const { registerFocusable, unregisterFocusable, setFocus } = useFocusManager();
  
  useEffect(() => {
    if (ref.current) {
      registerFocusable(id, ref);
      
      if (autoFocus) {
        setFocus(id);
      }
    }
    
    return () => {
      unregisterFocusable(id);
    };
  }, [id, registerFocusable, unregisterFocusable, setFocus, autoFocus]);
  
  return React.cloneElement(children, { ref });
};
