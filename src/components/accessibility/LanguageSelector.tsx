import React from 'react';
import { useTranslation, Language } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface LanguageSelectorProps {
  /** Whether to show language names in their native language */
  showNativeNames?: boolean;
  /** Whether to show language flags */
  showFlags?: boolean;
  /** Whether to show the current language in the trigger button */
  showCurrentLanguage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Variant of the trigger button */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  /** Size of the trigger button */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Whether to announce language changes to screen readers */
  announceChanges?: boolean;
}

/**
 * LanguageSelector component for changing the application language
 * 
 * @component
 * @example
 * <LanguageSelector showNativeNames showFlags />
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  showNativeNames = true,
  showFlags = true,
  showCurrentLanguage = true,
  className = '',
  variant = 'outline',
  size = 'default',
  announceChanges = true,
}) => {
  const { language, setLanguage, supportedLanguages, t } = useTranslation();
  const { announce } = useAccessibility();
  
  // Get language flag emoji
  const getLanguageFlag = (languageCode: Language): string => {
    switch (languageCode) {
      case 'en':
        return '🇬🇧';
      case 'fr':
        return '🇫🇷';
      case 'es':
        return '🇪🇸';
      case 'de':
        return '🇩🇪';
      case 'it':
        return '🇮🇹';
      case 'pt':
        return '🇵🇹';
      case 'ar':
        return '🇸🇦';
      default:
        return '🌐';
    }
  };
  
  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;
    
    setLanguage(newLanguage);
    
    // Announce language change
    if (announceChanges) {
      const languageName = supportedLanguages.find(lang => lang.code === newLanguage)?.name || newLanguage;
      announce(t('announcements.languageChanged', 'common', { language: languageName }));
    }
  };
  
  // Get current language name
  const currentLanguageName = supportedLanguages.find(lang => lang.code === language)?.name || language;
  const currentLanguageNativeName = supportedLanguages.find(lang => lang.code === language)?.nativeName || language;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('flex items-center gap-2', className)}
          aria-label={t('navigation.language', 'common')}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          {showCurrentLanguage && (
            <span>
              {showFlags && <span className="mr-1" aria-hidden="true">{getLanguageFlag(language)}</span>}
              {showNativeNames ? currentLanguageNativeName : currentLanguageName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('navigation.language', 'common')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map(({ code, name, nativeName }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              code === language && 'bg-primary/10 font-medium'
            )}
          >
            {showFlags && (
              <span className="text-base" aria-hidden="true">
                {getLanguageFlag(code)}
              </span>
            )}
            <span>
              {showNativeNames ? nativeName : name}
              {showNativeNames && code !== language && (
                <span className="text-muted-foreground ml-2 text-xs">
                  ({name})
                </span>
              )}
            </span>
            {code === language && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
