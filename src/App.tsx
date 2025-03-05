
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
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "./utils/supabase";

const queryClient = new QueryClient();

// Composant amélioré pour gérer les callbacks d'authentification OAuth
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
          } else {
            console.log("Session after hash processing:", data.session);
            
            if (data.session) {
              console.log("Authentication successful, redirecting to dashboard");
              // Effacer le hash de l'URL pour des raisons de sécurité
              if (window.history.replaceState) {
                window.history.replaceState(null, document.title, '/dashboard');
              } else {
                navigate('/dashboard');
              }
              return;
            }
          }
        } catch (err) {
          console.error("Error during auth callback processing:", err);
        }
      }
      
      if (search && search.includes("code=")) {
        console.log("Authorization code found in search params, processing...");
        // Le code d'autorisation sera traité automatiquement par Supabase
        
        // Vérifier si la session a été établie
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Session established with code, redirecting to dashboard");
          navigate('/dashboard');
          return;
        }
      }
      
      // Si nous arrivons ici, c'est qu'il y a eu un problème avec l'authentification
      console.log("No valid auth parameters found or authentication failed");
      navigate('/signin');
    };
    
    processAuth();
  }, [location, navigate]);
  
  // Afficher un indicateur de chargement pendant le traitement
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Authentification en cours...</p>
      </div>
    </div>
  );
};

// Composant Root pour traiter le hash dans l'URL avant le routage
const RootComponent = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Vérifier s'il y a un hash fragment d'authentification dans l'URL
    const { hash } = location;
    if (hash && hash.includes('access_token')) {
      console.log('Detected access_token in URL, processing...');
    }
  }, [location]);
  
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Root route for handling hash fragments */}
      <Route index element={<AuthCallback />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Index />} />
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
