import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  // Screen reader support
  announcements: string[];
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;

  // High contrast mode
  highContrast: boolean;
  toggleHighContrast: () => void;

  // Font size
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;

  // Reduced motion
  reducedMotion: boolean;
  toggleReducedMotion: () => void;

  // Focus indicators
  enhancedFocus: boolean;
  toggleEnhancedFocus: () => void;

  // Text spacing
  enhancedTextSpacing: boolean;
  toggleEnhancedTextSpacing: () => void;

  // Dyslexia friendly font
  dyslexiaFriendly: boolean;
  toggleDyslexiaFriendly: () => void;

  // Keyboard navigation
  keyboardMode: boolean;
  setKeyboardMode: (enabled: boolean) => void;

  // Screen reader hints
  screenReaderHints: boolean;
  toggleScreenReaderHints: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Provider component for accessibility features
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} AccessibilityProvider component
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Screen reader announcements
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // High contrast mode
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-high-contrast');
    return saved ? JSON.parse(saved) : false;
  });

  // Font size
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'x-large'>(() => {
    const saved = localStorage.getItem('naat-font-size');
    return saved ? JSON.parse(saved) : 'normal';
  });

  // Reduced motion
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-reduced-motion');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return saved ? JSON.parse(saved) : prefersReducedMotion;
  });

  // Enhanced focus indicators
  const [enhancedFocus, setEnhancedFocus] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-enhanced-focus');
    return saved ? JSON.parse(saved) : false;
  });

  // Enhanced text spacing
  const [enhancedTextSpacing, setEnhancedTextSpacing] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-enhanced-text-spacing');
    return saved ? JSON.parse(saved) : false;
  });

  // Dyslexia friendly font
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-dyslexia-friendly');
    return saved ? JSON.parse(saved) : false;
  });

  // Keyboard navigation mode
  const [keyboardMode, setKeyboardModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-keyboard-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Screen reader hints
  const [screenReaderHints, setScreenReaderHints] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-screen-reader-hints');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply high contrast mode
  useEffect(() => {
    const root = window.document.documentElement;

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    localStorage.setItem('naat-high-contrast', JSON.stringify(highContrast));
  }, [highContrast]);

  // Apply font size
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('text-normal', 'text-large', 'text-x-large');
    root.classList.add(`text-${fontSize}`);

    localStorage.setItem('naat-font-size', JSON.stringify(fontSize));
  }, [fontSize]);

  // Apply reduced motion
  useEffect(() => {
    const root = window.document.documentElement;

    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    localStorage.setItem('naat-reduced-motion', JSON.stringify(reducedMotion));
  }, [reducedMotion]);

  // Apply enhanced focus
  useEffect(() => {
    const root = window.document.documentElement;

    if (enhancedFocus) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    localStorage.setItem('naat-enhanced-focus', JSON.stringify(enhancedFocus));
  }, [enhancedFocus]);

  // Apply enhanced text spacing
  useEffect(() => {
    const root = window.document.documentElement;

    if (enhancedTextSpacing) {
      root.classList.add('enhanced-text-spacing');
    } else {
      root.classList.remove('enhanced-text-spacing');
    }

    localStorage.setItem('naat-enhanced-text-spacing', JSON.stringify(enhancedTextSpacing));
  }, [enhancedTextSpacing]);

  // Apply dyslexia friendly font
  useEffect(() => {
    const root = window.document.documentElement;

    if (dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly');
    } else {
      root.classList.remove('dyslexia-friendly');
    }

    localStorage.setItem('naat-dyslexia-friendly', JSON.stringify(dyslexiaFriendly));
  }, [dyslexiaFriendly]);

  // Apply keyboard mode
  useEffect(() => {
    const root = window.document.documentElement;

    if (keyboardMode) {
      root.classList.add('keyboard-mode');

      // Add event listener to detect mouse usage
      const handleMouseDown = () => {
        setKeyboardModeState(false);
      };

      window.addEventListener('mousedown', handleMouseDown);

      return () => {
        window.removeEventListener('mousedown', handleMouseDown);
      };
    } else {
      root.classList.remove('keyboard-mode');
    }

    localStorage.setItem('naat-keyboard-mode', JSON.stringify(keyboardMode));
  }, [keyboardMode]);

  // Apply screen reader hints
  useEffect(() => {
    const root = window.document.documentElement;

    if (screenReaderHints) {
      root.classList.add('screen-reader-hints');
    } else {
      root.classList.remove('screen-reader-hints');
    }

    localStorage.setItem('naat-screen-reader-hints', JSON.stringify(screenReaderHints));
  }, [screenReaderHints]);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only set keyboard mode if it's a Tab key press
      if (event.key === 'Tab') {
        setKeyboardModeState(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Announce messages for screen readers
  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    // Add the announcement with a unique ID
    setAnnouncements(prev => [...prev, message]);

    // Remove the announcement after it's been read (5 seconds)
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 5000);
  };

  // Clear all announcements
  const clearAnnouncements = () => {
    setAnnouncements([]);
  };

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  // Set font size
  const setFontSize = (size: 'normal' | 'large' | 'x-large') => {
    setFontSizeState(size);
  };

  // Toggle reduced motion
  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  // Toggle enhanced focus
  const toggleEnhancedFocus = () => {
    setEnhancedFocus(prev => !prev);
  };

  // Toggle enhanced text spacing
  const toggleEnhancedTextSpacing = () => {
    setEnhancedTextSpacing(prev => !prev);
  };

  // Toggle dyslexia friendly font
  const toggleDyslexiaFriendly = () => {
    setDyslexiaFriendly(prev => !prev);
  };

  // Set keyboard mode
  const setKeyboardMode = (enabled: boolean) => {
    setKeyboardModeState(enabled);
  };

  // Toggle screen reader hints
  const toggleScreenReaderHints = () => {
    setScreenReaderHints(prev => !prev);
  };

  const value: AccessibilityContextType = {
    announcements,
    announce,
    clearAnnouncements,
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    reducedMotion,
    toggleReducedMotion,
    enhancedFocus,
    toggleEnhancedFocus,
    enhancedTextSpacing,
    toggleEnhancedTextSpacing,
    dyslexiaFriendly,
    toggleDyslexiaFriendly,
    keyboardMode,
    setKeyboardMode,
    screenReaderHints,
    toggleScreenReaderHints,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements.map((announcement, index) => (
          <div key={`${announcement}-${index}`}>{announcement}</div>
        ))}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to use accessibility features
 *
 * @returns {AccessibilityContextType} Accessibility context
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);

  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }

  return context;
}
