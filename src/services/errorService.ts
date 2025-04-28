/**
 * Service de gestion centralisée des erreurs
 * Ce service permet de standardiser la gestion des erreurs dans l'application
 */

// Types d'erreurs
export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PAYMENT = 'payment',
  UNKNOWN = 'unknown',
}

// Interface d'erreur
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: any;
}

/**
 * Crée une erreur typée pour l'application
 * 
 * @param {ErrorType} type - Type d'erreur
 * @param {string} message - Message d'erreur
 * @param {string} code - Code d'erreur (optionnel)
 * @param {any} originalError - Erreur originale (optionnel)
 * @returns {AppError} Erreur typée
 */
export function createError(type: ErrorType, message: string, code?: string, originalError?: any): AppError {
  return {
    type,
    message,
    code,
    originalError,
  };
}

/**
 * Gère une erreur Supabase et la convertit en AppError
 * 
 * @param {any} error - Erreur Supabase
 * @returns {AppError} Erreur typée
 */
export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return createError(ErrorType.UNKNOWN, 'Une erreur inconnue est survenue');
  }

  // Erreurs d'authentification
  if (error.code?.startsWith('auth/') || error.message?.includes('auth')) {
    return createError(
      ErrorType.AUTH,
      getAuthErrorMessage(error.code || error.message),
      error.code,
      error
    );
  }

  // Erreurs de base de données
  if (error.code?.startsWith('PGRST') || error.code?.startsWith('23')) {
    return createError(
      ErrorType.DATABASE,
      'Erreur de base de données',
      error.code,
      error
    );
  }

  // Erreurs réseau
  if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'NETWORK_ERROR') {
    return createError(
      ErrorType.NETWORK,
      'Erreur de connexion. Veuillez vérifier votre connexion internet.',
      error.code,
      error
    );
  }

  // Erreur par défaut
  return createError(
    ErrorType.UNKNOWN,
    error.message || 'Une erreur inconnue est survenue',
    error.code,
    error
  );
}

/**
 * Obtient un message d'erreur convivial pour les erreurs d'authentification
 * 
 * @param {string} errorCode - Code d'erreur d'authentification
 * @returns {string} Message d'erreur convivial
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/invalid-login-credentials': 'Identifiants de connexion invalides',
    'auth/too-many-requests': 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
  };

  return errorMessages[errorCode] || 'Erreur d\'authentification';
}

/**
 * Hook pour utiliser le service d'erreur avec les toasts
 * 
 * @param {Function} toast - Fonction toast de l'application
 * @returns {Object} Fonctions de gestion d'erreur
 */
export function useErrorHandler(toast: any) {
  /**
   * Affiche une erreur dans un toast
   * 
   * @param {AppError} error - Erreur à afficher
   */
  const showErrorToast = (error: AppError) => {
    toast({
      title: getErrorTitle(error.type),
      description: error.message,
      variant: "destructive",
    });
  };

  /**
   * Gère une erreur et l'affiche dans un toast
   * 
   * @param {any} error - Erreur à gérer
   * @returns {AppError} Erreur typée
   */
  const handleError = (error: any): AppError => {
    const appError = handleSupabaseError(error);
    showErrorToast(appError);
    return appError;
  };

  return {
    handleError,
    showErrorToast,
    createError,
  };
}

/**
 * Obtient un titre pour un type d'erreur
 * 
 * @param {ErrorType} type - Type d'erreur
 * @returns {string} Titre de l'erreur
 */
function getErrorTitle(type: ErrorType): string {
  const titles: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Erreur de connexion',
    [ErrorType.AUTH]: 'Erreur d\'authentification',
    [ErrorType.DATABASE]: 'Erreur de base de données',
    [ErrorType.VALIDATION]: 'Erreur de validation',
    [ErrorType.PAYMENT]: 'Erreur de paiement',
    [ErrorType.UNKNOWN]: 'Erreur',
  };

  return titles[type];
}
