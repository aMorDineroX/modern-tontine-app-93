import React from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accessibility,
  Eye,
  Type,
  Zap,
  Keyboard,
  Maximize,
  BookOpen,
  Braces,
  Sparkles
} from 'lucide-react';

interface AccessibilitySettingsProps {
  /** Additional CSS classes */
  className?: string;
  /** Custom trigger element */
  trigger?: React.ReactNode;
}

/**
 * AccessibilitySettings component for adjusting accessibility preferences
 *
 * @component
 * @example
 * <AccessibilitySettings />
 */
const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  className = '',
  trigger,
}) => {
  const {
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
  } = useAccessibility();

  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            className={className}
            aria-label="Accessibility settings"
          >
            <Accessibility className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>
            Customize your experience to make the application more accessible.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="display">Affichage</TabsTrigger>
            <TabsTrigger value="reading">Lecture</TabsTrigger>
            <TabsTrigger value="interaction">Interaction</TabsTrigger>
          </TabsList>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <Label htmlFor="high-contrast" className="font-medium">
                  Mode contraste élevé
                </Label>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
                aria-label="Activer le mode contraste élevé"
              />
            </div>

            {/* Enhanced Focus */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Maximize className="h-5 w-5" />
                <Label htmlFor="enhanced-focus" className="font-medium">
                  Focus amélioré
                </Label>
              </div>
              <Switch
                id="enhanced-focus"
                checked={enhancedFocus}
                onCheckedChange={toggleEnhancedFocus}
                aria-label="Activer le focus amélioré"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Type className="h-5 w-5" />
                <Label className="font-medium">Taille de police</Label>
              </div>
              <RadioGroup
                value={fontSize}
                onValueChange={(value) => setFontSize(value as 'normal' | 'large' | 'x-large')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="font-normal" />
                  <Label htmlFor="font-normal">Normale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large">Grande</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="x-large" id="font-x-large" />
                  <Label htmlFor="font-x-large">Très grande</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <Label htmlFor="reduced-motion" className="font-medium">
                  Animations réduites
                </Label>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={toggleReducedMotion}
                aria-label="Activer les animations réduites"
              />
            </div>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading" className="space-y-6">
            {/* Enhanced Text Spacing */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Maximize className="h-5 w-5" />
                <Label htmlFor="enhanced-text-spacing" className="font-medium">
                  Espacement de texte amélioré
                </Label>
              </div>
              <Switch
                id="enhanced-text-spacing"
                checked={enhancedTextSpacing}
                onCheckedChange={toggleEnhancedTextSpacing}
                aria-label="Activer l'espacement de texte amélioré"
              />
            </div>

            {/* Dyslexia Friendly Font */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <Label htmlFor="dyslexia-friendly" className="font-medium">
                  Police adaptée à la dyslexie
                </Label>
              </div>
              <Switch
                id="dyslexia-friendly"
                checked={dyslexiaFriendly}
                onCheckedChange={toggleDyslexiaFriendly}
                aria-label="Activer la police adaptée à la dyslexie"
              />
            </div>

            {/* Screen Reader Hints */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Braces className="h-5 w-5" />
                <Label htmlFor="screen-reader-hints" className="font-medium">
                  Indices pour lecteurs d'écran
                </Label>
              </div>
              <Switch
                id="screen-reader-hints"
                checked={screenReaderHints}
                onCheckedChange={toggleScreenReaderHints}
                aria-label="Afficher les indices pour lecteurs d'écran"
              />
            </div>

            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p>
                Les indices pour lecteurs d'écran affichent visuellement les attributs ARIA et autres informations
                d'accessibilité normalement invisibles. Cette option est destinée aux développeurs et aux testeurs.
              </p>
            </div>
          </TabsContent>

          {/* Interaction Tab */}
          <TabsContent value="interaction" className="space-y-6">
            {/* Keyboard Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Keyboard className="h-5 w-5" />
                <Label htmlFor="keyboard-mode" className="font-medium">
                  Mode clavier
                </Label>
              </div>
              <Switch
                id="keyboard-mode"
                checked={keyboardMode}
                onCheckedChange={setKeyboardMode}
                aria-label="Activer le mode clavier"
              />
            </div>

            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p>
                Le mode clavier est automatiquement activé lorsque vous utilisez la touche Tab pour naviguer.
                Il améliore la visibilité des éléments focalisés pour faciliter la navigation au clavier.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <Label className="font-medium">Raccourcis clavier</Label>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  // Show keyboard shortcuts dialog
                  const event = new KeyboardEvent('keydown', { key: '?' });
                  window.dispatchEvent(event);
                }}
              >
                Afficher les raccourcis clavier
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilitySettings;
