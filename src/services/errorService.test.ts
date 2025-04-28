import { describe, it, expect, vi } from 'vitest';
import {
  ErrorType,
  createError,
  handleSupabaseError,
  useErrorHandler
} from './errorService';

describe('errorService', () => {
  describe('createError', () => {
    it('should create an error with required fields', () => {
      const error = createError(ErrorType.NETWORK, 'Network error');
      
      expect(error).toEqual({
        type: ErrorType.NETWORK,
        message: 'Network error',
        code: undefined,
        originalError: undefined,
      });
    });
    
    it('should create an error with all fields', () => {
      const originalError = new Error('Original error');
      const error = createError(ErrorType.AUTH, 'Auth error', 'AUTH_001', originalError);
      
      expect(error).toEqual({
        type: ErrorType.AUTH,
        message: 'Auth error',
        code: 'AUTH_001',
        originalError,
      });
    });
  });
  
  describe('handleSupabaseError', () => {
    it('should handle null or undefined error', () => {
      const error = handleSupabaseError(null);
      
      expect(error).toEqual({
        type: ErrorType.UNKNOWN,
        message: 'Une erreur inconnue est survenue',
        code: undefined,
        originalError: undefined,
      });
    });
    
    it('should handle authentication error with code', () => {
      const supabaseError = {
        code: 'auth/invalid-email',
        message: 'Invalid email',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.AUTH,
        message: 'Adresse email invalide',
        code: 'auth/invalid-email',
        originalError: supabaseError,
      });
    });
    
    it('should handle authentication error with message', () => {
      const supabaseError = {
        message: 'auth: Invalid credentials',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.AUTH,
        message: 'Erreur d\'authentification',
        code: undefined,
        originalError: supabaseError,
      });
    });
    
    it('should handle database error', () => {
      const supabaseError = {
        code: 'PGRST123',
        message: 'Database error',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.DATABASE,
        message: 'Erreur de base de données',
        code: 'PGRST123',
        originalError: supabaseError,
      });
    });
    
    it('should handle network error with message', () => {
      const supabaseError = {
        message: 'Failed to fetch: network error',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.NETWORK,
        message: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
        code: undefined,
        originalError: supabaseError,
      });
    });
    
    it('should handle network error with code', () => {
      const supabaseError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.NETWORK,
        message: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
        code: 'NETWORK_ERROR',
        originalError: supabaseError,
      });
    });
    
    it('should handle unknown error', () => {
      const supabaseError = {
        code: 'UNKNOWN',
        message: 'Unknown error',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.UNKNOWN,
        message: 'Unknown error',
        code: 'UNKNOWN',
        originalError: supabaseError,
      });
    });
    
    it('should handle unknown error without message', () => {
      const supabaseError = {
        code: 'UNKNOWN',
      };
      
      const error = handleSupabaseError(supabaseError);
      
      expect(error).toEqual({
        type: ErrorType.UNKNOWN,
        message: 'Une erreur inconnue est survenue',
        code: 'UNKNOWN',
        originalError: supabaseError,
      });
    });
  });
  
  describe('useErrorHandler', () => {
    it('should return error handling functions', () => {
      const toastMock = vi.fn();
      const errorHandler = useErrorHandler(toastMock);
      
      expect(errorHandler).toHaveProperty('handleError');
      expect(errorHandler).toHaveProperty('showErrorToast');
      expect(errorHandler).toHaveProperty('createError');
      
      expect(typeof errorHandler.handleError).toBe('function');
      expect(typeof errorHandler.showErrorToast).toBe('function');
      expect(typeof errorHandler.createError).toBe('function');
    });
    
    it('should show error toast and return error', () => {
      const toastMock = vi.fn();
      const errorHandler = useErrorHandler(toastMock);
      
      const supabaseError = {
        code: 'auth/invalid-email',
        message: 'Invalid email',
      };
      
      const result = errorHandler.handleError(supabaseError);
      
      expect(result).toEqual({
        type: ErrorType.AUTH,
        message: 'Adresse email invalide',
        code: 'auth/invalid-email',
        originalError: supabaseError,
      });
      
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Erreur d\'authentification',
        description: 'Adresse email invalide',
        variant: 'destructive',
      });
    });
    
    it('should show error toast directly', () => {
      const toastMock = vi.fn();
      const errorHandler = useErrorHandler(toastMock);
      
      const appError = createError(ErrorType.PAYMENT, 'Payment failed');
      
      errorHandler.showErrorToast(appError);
      
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Erreur de paiement',
        description: 'Payment failed',
        variant: 'destructive',
      });
    });
  });
});
