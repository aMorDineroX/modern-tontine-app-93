import { useState, useEffect } from 'react';

/**
 * Types de force de mot de passe
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

/**
 * Interface pour le résultat de l'évaluation de la force du mot de passe
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Hook personnalisé pour évaluer la force d'un mot de passe
 * 
 * @param password - Le mot de passe à évaluer
 * @param minLength - Longueur minimale requise (par défaut: 8)
 * @returns Résultat de l'évaluation de la force du mot de passe
 */
export function usePasswordStrength(
  password: string,
  minLength: number = 8
): PasswordStrengthResult {
  const [result, setResult] = useState<PasswordStrengthResult>({
    strength: 'weak',
    score: 0,
    feedback: '',
    isValid: false,
    validationErrors: [],
  });

  useEffect(() => {
    // Validation de base
    const errors: string[] = [];
    if (password.length < minLength) {
      errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Calcul du score
    let score = 0;
    if (password.length >= minLength) score += 20;
    if (password.length >= minLength + 4) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 10;

    // Détermination de la force
    let strength: PasswordStrength = 'weak';
    let feedback = 'Mot de passe faible';
    
    if (score >= 90) {
      strength = 'very-strong';
      feedback = 'Mot de passe très fort';
    } else if (score >= 70) {
      strength = 'strong';
      feedback = 'Mot de passe fort';
    } else if (score >= 40) {
      strength = 'medium';
      feedback = 'Mot de passe moyen';
    }

    setResult({
      strength,
      score,
      feedback,
      isValid: errors.length === 0,
      validationErrors: errors,
    });
  }, [password, minLength]);

  return result;
}
