import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { FormMessage } from './ui/form';

/**
 * Interface des propriétés du composant AccessibleFormField
 */
interface AccessibleFormFieldProps {
  /** ID unique du champ */
  id: string;
  /** Libellé du champ */
  label: string;
  /** Type de l'input */
  type?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Message d'erreur */
  error?: string;
  /** Texte d'aide */
  helpText?: string;
  /** Props supplémentaires pour l'input */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Composant AccessibleFormField - Champ de formulaire accessible
 * 
 * @component
 * @example
 * <AccessibleFormField
 *   id="email"
 *   label="Adresse email"
 *   type="email"
 *   required
 *   error={errors.email?.message}
 *   helpText="Nous ne partagerons jamais votre email."
 *   inputProps={{
 *     placeholder: "exemple@email.com",
 *     ...register("email")
 *   }}
 * />
 */
const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  type = 'text',
  required = false,
  error,
  helpText,
  inputProps = {}
}) => {
  // Générer un ID pour le texte d'aide
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Générer un ID pour le message d'erreur
  const errorId = error ? `${id}-error` : undefined;
  
  // Combiner les attributs aria
  const ariaProps = {
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': [helpTextId, errorId].filter(Boolean).join(' ') || undefined
  };
  
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        )}
      </Label>
      
      <Input
        id={id}
        type={type}
        {...ariaProps}
        {...inputProps}
        className={`${error ? 'border-destructive focus-visible:ring-destructive' : ''} ${inputProps.className || ''}`}
      />
      
      {helpText && (
        <p id={helpTextId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default AccessibleFormField;
