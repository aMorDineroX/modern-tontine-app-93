import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeSelectorProps {
  className?: string;
}

/**
 * Composant pour sélectionner le thème de l'application
 * 
 * @component
 * @param {ThemeSelectorProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ThemeSelector
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = "" }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={className}
          aria-label="Sélectionner un thème"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" aria-hidden="true" />
          <span>Clair</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" aria-hidden="true" />
          <span>Sombre</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Laptop className="h-4 w-4" aria-hidden="true" />
          <span>Système</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
