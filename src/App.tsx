import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import TontineCycles from "./pages/TontineCycles";
import Statistics from "./pages/Statistics";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import Transactions from "./pages/Transactions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const LoadingScreen = ({ message = "Chargement..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

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
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing session:", error);
            navigate('/signin', { replace: true });
          } else {
            console.log("Session after hash processing:", data.session);
            
            if (data.session) {
              console.log("Authentication successful, redirecting to dashboard");
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
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Session established with code, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      
      setIsProcessing(false);
      
      if (window.location.pathname === "/auth/callback") {
        navigate('/signin', { replace: true });
      }
    };
    
    processAuth();
  }, [location, navigate]);
  
  if (isProcessing) {
    return <LoadingScreen message="Authentification en cours..." />;
  }
  
  return null;
};

const RootComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  
  useEffect(() => {
    const { hash } = location;
    if (hash && hash.includes('access_token')) {
      console.log('Detected access_token in URL hash, processing...');
      setIsProcessingAuth(true);
      
      (async () => {
        try {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          console.log("Extracted access token from hash:", accessToken ? "Present (first chars: " + accessToken.substring(0, 10) + "...)" : "Not found");
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing token from URL:", error);
            navigate('/signin', { replace: true });
          } else if (data.session) {
            console.log("Successfully processed auth token from URL hash");
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
      
      return;
    }
  }, [location, navigate]);
  
  if (isProcessingAuth) {
    return <LoadingScreen message="Traitement de l'authentification..." />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/premium" element={<Premium />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Index />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tontine-cycles" element={<TontineCycles />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RootComponent />
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
