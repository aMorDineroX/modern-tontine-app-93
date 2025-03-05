
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
      console.log(`Signing in with ${provider}...`);
      
      // Utiliser window.location.origin comme URL de base pour la redirection
      // puis ajouter spécifiquement le chemin /auth/callback
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
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
