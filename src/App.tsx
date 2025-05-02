
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import Services from "./pages/Services";
import EnhancedFeatures from "./pages/EnhancedFeatures";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { KeyboardShortcutsProvider } from "./contexts/KeyboardShortcutsContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import Transactions from "./pages/Transactions";
import PayPalTransactions from "./pages/Transactions/PayPalTransactions";
import Layout from "./components/Layout";
import { lazy, Suspense } from 'react';
// Utilisation du composant LoadingScreen importé
import { LoadingScreen } from './components/LoadingScreen';
import SkipToContent from "./components/accessibility/SkipToContent";
import Announcer from "./components/accessibility/Announcer";
import KeyboardShortcutsDialog from "./components/accessibility/KeyboardShortcutsDialog";

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
    <>
      {/* Skip to content link for keyboard users */}
      <SkipToContent contentId="main-content" />

      {/* Screen reader announcements */}
      <Announcer />

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog />

      <Routes>
        {/* Public routes without navbar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes with navbar */}
        <Route path="/premium" element={<Layout><Premium /></Layout>} />
        <Route path="/dashboard" element={<Layout><Index /></Layout>} />
        <Route path="/groups" element={
          <Suspense fallback={<LoadingScreen message="Chargement..." />}>
            <Layout><Groups /></Layout>
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingScreen message="Chargement..." />}>
            <Layout><Profile /></Layout>
          </Suspense>
        } />
        <Route path="/tontine-cycles" element={<Layout><TontineCycles /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/transactions/paypal" element={<Layout><PayPalTransactions /></Layout>} />
        <Route path="/statistics" element={
          <Suspense fallback={<LoadingScreen message="Chargement..." />}>
            <Layout><Statistics /></Layout>
          </Suspense>
        } />
        <Route path="/services" element={
          <Suspense fallback={<LoadingScreen message="Chargement..." />}>
            <Layout><Services /></Layout>
          </Suspense>
        } />
        <Route path="/enhanced-features" element={
          <Suspense fallback={<LoadingScreen message="Chargement..." />}>
            <Layout><EnhancedFeatures /></Layout>
          </Suspense>
        } />

        {/* Not found page */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="naat-theme">
      <TranslationProvider>
        <AccessibilityProvider>
          <AppProvider>
            <AuthProvider>
              <ChatProvider>
                <HelmetProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <KeyboardShortcutsProvider>
                        <RootComponent />
                      </KeyboardShortcutsProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </HelmetProvider>
              </ChatProvider>
            </AuthProvider>
          </AppProvider>
        </AccessibilityProvider>
      </TranslationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
