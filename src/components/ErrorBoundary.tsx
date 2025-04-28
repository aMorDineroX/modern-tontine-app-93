import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Composant enfant à rendre */
  children: ReactNode;
  /** Composant de fallback à afficher en cas d'erreur */
  fallback?: ReactNode;
  /** Fonction appelée lorsqu'une erreur est capturée */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  /** Indique si une erreur a été capturée */
  hasError: boolean;
  /** L'erreur capturée */
  error: Error | null;
}

/**
 * Composant ErrorBoundary - Capture les erreurs dans les composants enfants
 * et affiche un composant de fallback en cas d'erreur
 * 
 * @component
 * @example
 * <ErrorBoundary
 *   fallback={<div>Une erreur est survenue</div>}
 *   onError={(error) => console.error(error)}
 * >
 *   <MonComposant />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour afficher le fallback
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Journaliser l'erreur
    console.error('ErrorBoundary a capturé une erreur:', error, errorInfo);
    
    // Appeler la fonction onError si elle est fournie
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Afficher le fallback personnalisé ou le fallback par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            Nous sommes désolés, une erreur inattendue s'est produite.
          </p>
          <details className="text-sm text-red-600 dark:text-red-300">
            <summary className="cursor-pointer font-medium">Détails de l'erreur</summary>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
