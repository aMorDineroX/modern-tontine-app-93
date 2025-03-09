import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Groups from "./pages/Groups"; // Import the Groups component
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";

const queryClient = new QueryClient();

// Composant pour l'écran de chargement
const LoadingScreen = ({ message = "Chargement..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Composant amélioré pour gérer les callbacks d'authentification OAuth
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const processAuth = async () => {
      console.log("Processing OAuth callback...");
      console.log("Location:", location);
      
      const { hash, search } = location;
      
      if (hash && hash.includes("access_token")) {
        console.log("Access token found in hash, processing...");
        
        try {
          // Laisser Supabase traiter le hash fragment
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing session:", error);
            navigate('/signin', { replace: true });
          } else {
            console.log("Session after hash processing:", data.session);
            
            if (data.session) {
              console.log("Authentication successful, redirecting to dashboard");
              // Effacer le hash de l'URL pour des raisons de sécurité
              navigate('/dashboard', { replace: true });
              return;
            }
          }
        } catch (err) {
          console.error("Error during auth callback processing:", err);
          navigate('/signin', { replace: true });
        }
      }
      
      if (search && search.includes("code=")) {
        console.log("Authorization code found in search params, processing...");
        // Le code d'autorisation sera traité automatiquement par Supabase
        
        // Vérifier si la session a été établie
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Session established with code, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      
      // Si le traitement est terminé et qu'aucune redirection n'a eu lieu
      setIsProcessing(false);
      
      // Si nous arrivons ici sans redirection, on redirige vers la page de connexion
      if (window.location.pathname === "/auth/callback") {
        navigate('/signin', { replace: true });
      }
    };
    
    processAuth();
  }, [location, navigate]);
  
  // Afficher un indicateur de chargement pendant le traitement
  if (isProcessing) {
    return <LoadingScreen message="Authentification en cours..." />;
  }
  
  // Si le traitement est terminé mais que nous sommes toujours sur le composant AuthCallback
  // et pas sur la route /auth/callback, on rend les routes enfants
  return null;
};

// Composant Root pour traiter le hash dans l'URL avant le routage
const RootComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  
  useEffect(() => {
    // Vérifier s'il y a un hash fragment d'authentification dans l'URL
    const { hash } = location;
    if (hash && hash.includes('access_token')) {
      console.log('Detected access_token in URL hash, processing...');
      setIsProcessingAuth(true);
      
      // Traiter le token directement ici pour éviter des redirections inutiles
      (async () => {
        try {
          // Extraire le token du hash pour le débogage
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          console.log("Extracted access token from hash:", accessToken ? "Present (first chars: " + accessToken.substring(0, 10) + "...)" : "Not found");
          
          // Forcer Supabase à utiliser le token dans l'URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing token from URL:", error);
            navigate('/signin', { replace: true });
          } else if (data.session) {
            console.log("Successfully processed auth token from URL hash");
            // Rediriger vers le dashboard
            navigate('/dashboard', { replace: true });
          } else {
            console.log("No session established from URL hash");
            navigate('/signin', { replace: true });
          }
        } catch (err) {
          console.error("Exception during token processing:", err);
          navigate('/signin', { replace: true });
        } finally {
          setIsProcessingAuth(false);
        }
      })();
      
      // Retourner early pour éviter que le reste du composant ne s'exécute
      return;
    }
  }, [location, navigate]);
  
  // Afficher un indicateur de chargement pendant le traitement de l'authentification à la racine
  if (isProcessingAuth) {
    return <LoadingScreen message="Traitement de l'authentification..." />;
  }
  
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Index />} />
        <Route path="/groups" element={<Groups />} /> {/* Add the Groups route */}
        {/* Add more protected routes here */}
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RootComponent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
