
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

// Add Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBkVNRDYcQLBkA2c5nTKrDHvUGqraW9cX8";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  googleMapsApiKey: string; // Add Google Maps API key to the context
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction utilitaire pour détecter l'environnement d'exécution
const getEnvironmentInfo = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPreview = hostname.includes('lovable.app') || hostname.includes('preview');
  const isProduction = !isLocalhost && !isPreview;
  
  return {
    isLocalhost,
    isPreview,
    isProduction,
    hostname,
    fullOrigin: window.location.origin
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Bienvenue !",
        description: "Vous êtes maintenant connecté.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
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
            prompt: 'select_account', // Force l'affichage de la sélection de compte Google
            access_type: 'offline' // Demande un refresh token
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

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
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

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
        description: "Veuillez vérifier votre email pour réinitialiser votre mot de passe.",
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
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithProvider,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY, // Provide the Google Maps API key
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
