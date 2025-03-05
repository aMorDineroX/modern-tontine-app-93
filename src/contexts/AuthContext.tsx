
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for access token in URL hash (for OAuth redirects)
  useEffect(() => {
    const handleHashParams = async () => {
      // Check if we have an access token in the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      if (accessToken) {
        console.log("Found access token in URL, processing...");
        try {
          // Force Supabase to refresh the session with the token from the URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session from hash params:", error);
          } else {
            console.log("Successfully processed session from hash:", data.session);
            // Clear the hash to avoid exposing the token
            if (window.history.replaceState) {
              window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }
          }
        } catch (error) {
          console.error("Error processing hash params:", error);
        }
      }
    };
    
    handleHashParams();
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
      
      // Déterminer la bonne URL de redirection en fonction de l'environnement
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isPreview = window.location.hostname.includes('lovable');
      const baseUrl = window.location.origin;
      
      // Nous utilisons différentes stratégies pour les différents environnements
      let redirectUrl;
      
      if (isLocalhost) {
        // Pour localhost, nous utilisons l'URL de base car les fragments d'URL (#) fonctionnent bien
        redirectUrl = baseUrl;
        console.log("Using localhost strategy with hash fragment");
      } else if (isPreview) {
        // Pour l'environnement de prévisualisation Lovable
        redirectUrl = `${baseUrl}/auth/callback`;
        console.log("Using preview environment strategy with callback URL");
      } else {
        // Pour la production
        redirectUrl = `${baseUrl}/auth/callback`;
        console.log("Using production strategy with callback URL");
      }
      
      console.log("Environment:", 
        isLocalhost ? "localhost" : 
        isPreview ? "preview" : 
        "production");
      console.log("Base URL:", baseUrl);
      console.log("Redirect URL:", redirectUrl);
      console.log("Provider:", provider);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
          queryParams: {
            prompt: 'select_account', // Force Google to show account selection
            access_type: 'offline' // Request a refresh token
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
