import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKeyboardShortcuts, ShortcutCategory } from '@/contexts/KeyboardShortcutsContext';
import { Keyboard } from 'lucide-react';

/**
 * KeyboardShortcutsDialog component for displaying keyboard shortcuts
 * 
 * @component
 * @example
 * <KeyboardShortcutsDialog />
 */
const KeyboardShortcutsDialog: React.FC = () => {
  const { 
    shortcuts, 
    isShortcutsDialogOpen, 
    hideShortcutsDialog,
    enabled,
    setEnabled
  } = useKeyboardShortcuts();
  
  // Group shortcuts by category
  const shortcutsByCategory = React.useMemo(() => {
    const categories: Record<ShortcutCategory, typeof shortcuts> = {
      navigation: [],
      actions: [],
      accessibility: [],
      groups: [],
      global: [],
    };
    
    shortcuts.forEach(shortcut => {
      categories[shortcut.category].push(shortcut);
    });
    
    return categories;
  }, [shortcuts]);
  
  // Format key for display
  const formatKey = (key: string) => {
    switch (key) {
      case ' ':
        return 'Space';
      case 'ArrowUp':
        return '↑';
      case 'ArrowDown':
        return '↓';
      case 'ArrowLeft':
        return '←';
      case 'ArrowRight':
        return '→';
      default:
        return key;
    }
  };
  
  // Render a keyboard shortcut
  const renderShortcut = (shortcut: typeof shortcuts[0]) => (
    <div 
      key={shortcut.id} 
      className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex items-center space-x-1">
        {shortcut.keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
              {formatKey(key)}
            </kbd>
            {index < shortcut.keys.length - 1 && (
              <span className="text-gray-400 dark:text-gray-500">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  
  // Render a category of shortcuts
  const renderCategory = (category: ShortcutCategory, title: string) => {
    const categoryShortcuts = shortcutsByCategory[category];
    
    if (categoryShortcuts.length === 0) {
      return null;
    }
    
    return (
      <TabsContent value={category} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="rounded-md border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {categoryShortcuts.map(renderShortcut)}
          </div>
        </div>
      </TabsContent>
    );
  };
  
  return (
    <Dialog open={isShortcutsDialogOpen} onOpenChange={hideShortcutsDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer rapidement dans l'application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Activer les raccourcis clavier</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={enabled} 
              onChange={(e) => setEnabled(e.target.checked)} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
        
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
            <TabsTrigger value="groups">Groupes</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          {renderCategory('global', 'Raccourcis globaux')}
          {renderCategory('navigation', 'Navigation')}
          {renderCategory('accessibility', 'Accessibilité')}
          {renderCategory('groups', 'Gestion des groupes')}
          {renderCategory('actions', 'Actions')}
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button onClick={hideShortcutsDialog}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
