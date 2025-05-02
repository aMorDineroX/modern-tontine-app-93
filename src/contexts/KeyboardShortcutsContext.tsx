import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from './AccessibilityContext';
import { useToast } from '@/hooks/use-toast';

// Define shortcut categories
export type ShortcutCategory = 
  | 'navigation' 
  | 'actions' 
  | 'accessibility' 
  | 'groups' 
  | 'global';

// Define a shortcut
export interface Shortcut {
  id: string;
  keys: string[];
  description: string;
  category: ShortcutCategory;
  action: () => void;
  global?: boolean;
}

interface KeyboardShortcutsContextType {
  // Shortcuts management
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  
  // Shortcuts state
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  
  // Help dialog
  showShortcutsDialog: () => void;
  hideShortcutsDialog: () => void;
  isShortcutsDialogOpen: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

/**
 * Provider component for keyboard shortcuts
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} KeyboardShortcutsProvider component
 */
export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('naat-keyboard-shortcuts-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { toast } = useToast();
  
  // Register default shortcuts
  useEffect(() => {
    const defaultShortcuts: Shortcut[] = [
      {
        id: 'help',
        keys: ['?'],
        description: 'Afficher l\'aide des raccourcis clavier',
        category: 'global',
        action: () => setIsShortcutsDialogOpen(true),
        global: true,
      },
      {
        id: 'dashboard',
        keys: ['g', 'd'],
        description: 'Aller au tableau de bord',
        category: 'navigation',
        action: () => navigate('/dashboard'),
      },
      {
        id: 'groups',
        keys: ['g', 'g'],
        description: 'Aller à la page des groupes',
        category: 'navigation',
        action: () => navigate('/groups'),
      },
      {
        id: 'profile',
        keys: ['g', 'p'],
        description: 'Aller au profil',
        category: 'navigation',
        action: () => navigate('/profile'),
      },
      {
        id: 'statistics',
        keys: ['g', 's'],
        description: 'Aller aux statistiques',
        category: 'navigation',
        action: () => navigate('/statistics'),
      },
      {
        id: 'toggle-theme',
        keys: ['t', 'd'],
        description: 'Basculer entre le thème clair et sombre',
        category: 'accessibility',
        action: () => {
          const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark');
          localStorage.setItem('naat-theme', theme);
          announce(`Thème ${theme === 'dark' ? 'sombre' : 'clair'} activé`);
          toast({
            title: `Thème ${theme === 'dark' ? 'sombre' : 'clair'} activé`,
            duration: 2000,
          });
        },
      },
      {
        id: 'toggle-high-contrast',
        keys: ['t', 'c'],
        description: 'Activer/désactiver le mode contraste élevé',
        category: 'accessibility',
        action: () => {
          document.documentElement.classList.toggle('high-contrast');
          const highContrast = document.documentElement.classList.contains('high-contrast');
          localStorage.setItem('naat-high-contrast', JSON.stringify(highContrast));
          announce(`Mode contraste élevé ${highContrast ? 'activé' : 'désactivé'}`);
          toast({
            title: `Mode contraste élevé ${highContrast ? 'activé' : 'désactivé'}`,
            duration: 2000,
          });
        },
      },
      {
        id: 'toggle-reduced-motion',
        keys: ['t', 'm'],
        description: 'Activer/désactiver les animations réduites',
        category: 'accessibility',
        action: () => {
          document.documentElement.classList.toggle('reduce-motion');
          const reducedMotion = document.documentElement.classList.contains('reduce-motion');
          localStorage.setItem('naat-reduced-motion', JSON.stringify(reducedMotion));
          announce(`Animations réduites ${reducedMotion ? 'activées' : 'désactivées'}`);
          toast({
            title: `Animations réduites ${reducedMotion ? 'activées' : 'désactivées'}`,
            duration: 2000,
          });
        },
      },
      {
        id: 'create-group',
        keys: ['c', 'g'],
        description: 'Créer un nouveau groupe',
        category: 'groups',
        action: () => {
          // This would typically open the create group modal
          announce('Ouverture du formulaire de création de groupe');
          toast({
            title: 'Raccourci: Créer un groupe',
            description: 'Cette fonctionnalité sera bientôt disponible',
            duration: 2000,
          });
        },
      },
      {
        id: 'search',
        keys: ['/'],
        description: 'Rechercher',
        category: 'global',
        action: () => {
          // Focus the search input if it exists
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            announce('Focus sur la recherche');
          } else {
            announce('Champ de recherche non disponible sur cette page');
            toast({
              title: 'Recherche',
              description: 'Champ de recherche non disponible sur cette page',
              duration: 2000,
            });
          }
        },
        global: true,
      },
    ];
    
    setShortcuts(defaultShortcuts);
  }, [navigate, announce, toast]);
  
  // Save enabled state to localStorage
  useEffect(() => {
    localStorage.setItem('naat-keyboard-shortcuts-enabled', JSON.stringify(enabled));
  }, [enabled]);
  
  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;
    
    const keysPressed: Record<string, boolean> = {};
    let keySequence: string[] = [];
    let keySequenceTimer: NodeJS.Timeout | null = null;
    
    const resetKeySequence = () => {
      keySequence = [];
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if in an input, textarea, or contentEditable element
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        // Allow global shortcuts even in input fields
        const isGlobalShortcut = shortcuts.some(
          shortcut => 
            shortcut.global && 
            shortcut.keys.length === 1 && 
            shortcut.keys[0].toLowerCase() === event.key.toLowerCase()
        );
        
        if (!isGlobalShortcut) {
          return;
        }
      }
      
      // Record the key press
      const key = event.key.toLowerCase();
      keysPressed[key] = true;
      
      // Add to sequence for multi-key shortcuts
      keySequence.push(key);
      
      // Reset sequence after a delay
      if (keySequenceTimer) {
        clearTimeout(keySequenceTimer);
      }
      
      keySequenceTimer = setTimeout(resetKeySequence, 1000);
      
      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        // Single key shortcut
        if (shortcut.keys.length === 1 && shortcut.keys[0].toLowerCase() === key) {
          event.preventDefault();
          shortcut.action();
          return;
        }
        
        // Multi-key sequence shortcut
        if (
          shortcut.keys.length > 1 &&
          keySequence.length === shortcut.keys.length &&
          shortcut.keys.every((k, i) => k.toLowerCase() === keySequence[i])
        ) {
          event.preventDefault();
          shortcut.action();
          resetKeySequence();
          return;
        }
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      // Remove the key from pressed keys
      const key = event.key.toLowerCase();
      delete keysPressed[key];
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (keySequenceTimer) {
        clearTimeout(keySequenceTimer);
      }
    };
  }, [enabled, shortcuts, announce]);
  
  // Register a new shortcut
  const registerShortcut = (shortcut: Shortcut) => {
    setShortcuts(prev => {
      // Remove any existing shortcut with the same ID
      const filtered = prev.filter(s => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  };
  
  // Unregister a shortcut
  const unregisterShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(shortcut => shortcut.id !== id));
  };
  
  // Show shortcuts dialog
  const showShortcutsDialog = () => {
    setIsShortcutsDialogOpen(true);
  };
  
  // Hide shortcuts dialog
  const hideShortcutsDialog = () => {
    setIsShortcutsDialogOpen(false);
  };
  
  const value: KeyboardShortcutsContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    enabled,
    setEnabled,
    showShortcutsDialog,
    hideShortcutsDialog,
    isShortcutsDialogOpen,
  };
  
  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook to use keyboard shortcuts
 * 
 * @returns {KeyboardShortcutsContextType} Keyboard shortcuts context
 */
export function useKeyboardShortcuts(): KeyboardShortcutsContextType {
  const context = useContext(KeyboardShortcutsContext);
  
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  
  return context;
}
