
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Composant de redirection pour gestion OAuth
const AuthCallback = () => {
  useEffect(() => {
    // Permet à Supabase de finaliser la session après redirection OAuth
    const { hash, search } = window.location;
    if (hash || search) {
      console.log("Processing OAuth callback...");
      console.log("Hash:", hash);
      console.log("Search:", search);
      
      // Explicitement traiter le hash et search pour s'assurer que Supabase les traite
      if (hash && hash.includes("access_token")) {
        console.log("Access token found in hash, processing...");
      }
      
      if (search && search.includes("code=")) {
        console.log("Authorization code found in search params, processing...");
      }
    }
  }, []);
  
  // Rediriger vers le tableau de bord après traitement
  return <Navigate to="/dashboard" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                {/* Add more protected routes here */}
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
