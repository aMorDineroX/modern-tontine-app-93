import React from 'react';
import { PasswordStrengthResult } from '@/hooks/usePasswordStrength';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  result: PasswordStrengthResult;
  showFeedback?: boolean;
  className?: string;
}

/**
 * Composant d'indicateur de force de mot de passe
 * 
 * @param result - Résultat de l'évaluation de la force du mot de passe
 * @param showFeedback - Afficher ou non le feedback textuel
 * @param className - Classes CSS supplémentaires
 */
export default function PasswordStrengthMeter({
  result,
  showFeedback = true,
  className,
}: PasswordStrengthMeterProps) {
  const { strength, score, feedback } = result;

  // Déterminer la couleur en fonction de la force
  const getColorClass = () => {
    switch (strength) {
      case 'very-strong':
        return 'bg-green-500';
      case 'strong':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getColorClass())}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {showFeedback && (
        <p className={cn(
          "text-xs",
          strength === 'weak' ? 'text-red-500' :
          strength === 'medium' ? 'text-yellow-500' :
          strength === 'strong' ? 'text-blue-500' :
          'text-green-500'
        )}>
          {feedback}
        </p>
      )}
    </div>
  );
}
