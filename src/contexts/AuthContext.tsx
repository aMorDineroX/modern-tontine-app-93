import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

// Add Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBkVNRDYcQLBkA2c5nTKrDHvUGqraW9cX8";

/**
 * Interface pour les options de connexion
 */
interface SignInOptions {
  rememberMe?: boolean;
  redirectTo?: string;
}

/**
 * Interface pour les options d'inscription
 */
interface SignUpOptions {
  redirectTo?: string;
}

/**
 * Interface du contexte d'authentification
 *
 * @interface AuthContextType
 * @property {Session | null} session - La session Supabase actuelle
 * @property {User | null} user - L'utilisateur actuellement connecté
 * @property {boolean} loading - Indique si une opération d'authentification est en cours
 * @property {boolean} is2FARequired - Indique si l'authentification à deux facteurs est requise
 * @property {(email: string, password: string, options?: SignInOptions) => Promise<{ error?: Error, requires2FA?: boolean }>} signIn - Fonction pour se connecter avec email/mot de passe
 * @property {(email: string, password: string, fullName: string, options?: SignUpOptions) => Promise<void>} signUp - Fonction pour créer un compte
 * @property {() => Promise<void>} signOut - Fonction pour se déconnecter
 * @property {() => Promise<void>} signOutAllSessions - Fonction pour se déconnecter de toutes les sessions
 * @property {(email: string) => Promise<void>} resetPassword - Fonction pour réinitialiser le mot de passe
 * @property {(provider: Provider) => Promise<void>} signInWithProvider - Fonction pour se connecter avec un fournisseur OAuth
 * @property {() => Promise<{ error?: Error }>} signInWithGoogle - Fonction pour se connecter avec Google
 * @property {(code: string) => Promise<boolean>} verify2FA - Fonction pour vérifier le code 2FA
 * @property {(currentPassword: string, newPassword: string) => Promise<{ error?: Error }>} updatePassword - Fonction pour mettre à jour le mot de passe
 * @property {string} googleMapsApiKey - Clé API Google Maps
 */
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  is2FARequired: boolean;
  signIn: (email: string, password: string, options?: SignInOptions) => Promise<{ error?: Error, requires2FA?: boolean }>;
  signUp: (email: string, password: string, fullName: string, options?: SignUpOptions) => Promise<void>;
  signOut: (redirectCallback?: () => void) => Promise<void>;
  signOutAllSessions: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  verify2FA: (code: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: Error }>;
  googleMapsApiKey: string; // Clé API Google Maps
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to detect the execution environment
const getEnvironmentInfo = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPreview = hostname.includes('preview') || hostname.includes('staging');
  const isProduction = !isLocalhost && !isPreview;

  return {
    isLocalhost,
    isPreview,
    isProduction,
    hostname,
    fullOrigin: window.location.origin
  };
};

/**
 * Fournisseur du contexte d'authentification
 *
 * Ce composant fournit le contexte d'authentification à tous les composants enfants.
 * Il gère l'état d'authentification, les sessions utilisateur et les opérations d'authentification.
 *
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {ReactNode} props.children - Les composants enfants
 * @example
 * return (
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 * )
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        // Vérifier d'abord le hash fragment dans l'URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          console.log("Found access token in URL hash on initial load, processing...");
          // Le token sera traité automatiquement par Supabase lors de getSession()
        }

        // Obtenir la session initiale
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          console.log("Initial session check:", data.session);
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initialiser l'authentification
    initializeAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, options?: SignInOptions) => {
    try {
      setLoading(true);

      // Simuler la vérification 2FA pour certains comptes (à remplacer par une vraie implémentation)
      // Dans une vraie implémentation, cette vérification serait faite côté serveur
      const needsTwoFactor = email.includes('2fa') || email.includes('secure');

      if (needsTwoFactor) {
        // Stocker l'email pour la vérification 2FA ultérieure
        setPendingEmail(email);
        setIs2FARequired(true);
        return { requires2FA: true };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Définir la durée de session en fonction de l'option "Se souvenir de moi"
          // Par défaut, Supabase utilise une session de 1 heure
          // Avec "Se souvenir de moi", on peut étendre à 30 jours
          expiresIn: options?.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60,
        }
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Bienvenue !",
        description: "Vous êtes maintenant connecté.",
      });

      return {};
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifie le code d'authentification à deux facteurs
   *
   * @param code - Le code 2FA à vérifier
   * @returns true si le code est valide, false sinon
   */
  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Simuler la vérification du code 2FA
      // Dans une vraie implémentation, cette vérification serait faite côté serveur
      const isValid = code === '123456'; // Code de test

      if (isValid && pendingEmail) {
        // Si le code est valide, connecter l'utilisateur
        const { error } = await supabase.auth.signInWithPassword({
          email: pendingEmail,
          password: 'password', // Ceci est juste pour la démo, dans une vraie implémentation, le serveur gérerait cela
        });

        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Vérification réussie",
          description: "Vous êtes maintenant connecté.",
        });

        // Réinitialiser l'état 2FA
        setIs2FARequired(false);
        setPendingEmail(null);

        return true;
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, options?: SignUpOptions) => {
    try {
      setLoading(true);

      // Déterminer l'URL de redirection après la vérification de l'email
      const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            created_at: new Date().toISOString(),
          },
          emailRedirectTo: redirectTo,
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Bienvenue !",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour le mot de passe de l'utilisateur
   *
   * @param currentPassword - Le mot de passe actuel
   * @param newPassword - Le nouveau mot de passe
   * @returns Un objet contenant une erreur éventuelle
   */
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);

      // Vérifier d'abord le mot de passe actuel
      // Note: Supabase n'a pas de méthode directe pour cela, donc nous simulons une connexion
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        toast({
          title: "Erreur de vérification",
          description: "Le mot de passe actuel est incorrect.",
          variant: "destructive",
        });
        return { error: new Error("Le mot de passe actuel est incorrect.") };
      }

      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Erreur de mise à jour",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      return {};
    } catch (error) {
      console.error('Error updating password:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in with ${provider}...`);

      // Déterminer les informations sur l'environnement
      const env = getEnvironmentInfo();
      console.log("Environment info:", env);

      let redirectUrl;

      if (env.isLocalhost) {
        // Pour localhost, on utilise la racine et on traite le hash fragment
        redirectUrl = env.fullOrigin;
        console.log("Using localhost strategy with root URL for redirection");
      } else if (env.isPreview) {
        // Pour les environnements de prévisualisation
        redirectUrl = `${env.fullOrigin}/auth/callback`;
        console.log("Using preview environment strategy with callback URL");
      } else {
        // Pour la production
        redirectUrl = `${env.fullOrigin}/auth/callback`;
        console.log("Using production strategy with callback URL");
      }

      console.log("Final redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });

      console.log(`Sign in with ${provider} response:`, data);

      if (error) {
        toast({
          title: `Erreur de connexion avec ${provider}`,
          description: error.message,
          variant: "destructive",
        });
        console.error(`Error signing in with ${provider}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile',
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur de connexion avec Google",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (redirectCallback?: () => void) => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });

      // Execute the redirect callback if provided
      if (redirectCallback) {
        redirectCallback();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Un problème est survenu lors de la déconnexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnecte l'utilisateur de toutes ses sessions
   * Cette fonction utilise le paramètre scope: 'global' pour déconnecter l'utilisateur de tous ses appareils
   */
  const signOutAllSessions = async () => {
    try {
      setLoading(true);
      // Utiliser le paramètre scope: 'global' pour déconnecter de toutes les sessions
      await supabase.auth.signOut({ scope: 'global' });
      console.log("Déconnexion de toutes les sessions réussie");
    } catch (error) {
      console.error('Error signing out from all sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);

      // Déterminer l'URL de redirection pour la réinitialisation du mot de passe
      // Utiliser la page dédiée à la réinitialisation du mot de passe
      // Ajouter explicitement le paramètre type=recovery pour s'assurer que la redirection fonctionne correctement
      const resetUrl = `${window.location.origin}/reset-password?type=recovery`;
      console.log("Reset password redirect URL:", resetUrl);

      // Déconnecter l'utilisateur de toutes ses sessions pour des raisons de sécurité
      // Cela garantit que si quelqu'un a accès à l'email de l'utilisateur, il ne pourra pas
      // continuer à utiliser les sessions existantes
      try {
        // Si l'utilisateur est actuellement connecté, déconnectez-le de toutes ses sessions
        if (session) {
          console.log("Déconnexion de toutes les sessions avant la réinitialisation du mot de passe");
          await signOutAllSessions();
        }
      } catch (signOutError) {
        console.error("Erreur lors de la déconnexion des sessions:", signOutError);
        // Continuer avec la réinitialisation du mot de passe même si la déconnexion échoue
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) {
        toast({
          title: "Erreur de réinitialisation du mot de passe",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Email de réinitialisation envoyé",
        description: "Veuillez vérifier votre email pour réinitialiser votre mot de passe. Toutes vos sessions ont été déconnectées pour des raisons de sécurité.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    is2FARequired,
    signIn,
    signUp,
    signOut,
    signOutAllSessions,
    resetPassword,
    signInWithProvider,
    signInWithGoogle,
    verify2FA,
    updatePassword,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
