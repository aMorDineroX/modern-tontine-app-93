import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, Info, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TwoFactorAuth from "@/components/Auth/TwoFactorAuth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SignIn() {
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // États de validation
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const { t } = useApp();
  const { signIn, signInWithGoogle, verify2FA, is2FARequired } = useAuth();

  // Charger l'email sauvegardé si disponible
  useEffect(() => {
    const savedEmail = localStorage.getItem("naat_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Validation de l'email
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("L'email est requis");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Veuillez entrer une adresse email valide");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Validation du mot de passe
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Le mot de passe est requis");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Validation du formulaire complet
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    return isEmailValid && isPasswordValid;
  };

  // Gestion des changements d'email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      validateEmail(value);
    }
  };

  // Gestion des changements de mot de passe
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      validatePassword(value);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marquer tous les champs comme touchés pour afficher les erreurs
    setEmailTouched(true);
    setPasswordTouched(true);

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sauvegarder l'email si "Se souvenir de moi" est coché
      if (rememberMe) {
        localStorage.setItem("naat_remembered_email", email);
      } else {
        localStorage.removeItem("naat_remembered_email");
      }

      const { error, requires2FA } = await signIn(email, password, { rememberMe });

      if (error) {
        throw error;
      }

      if (requires2FA) {
        setShow2FA(true);
        return;
      }

      // Animation de succès avant la redirection
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à votre compte.",
        variant: "default",
      });

      // Redirection avec un léger délai pour montrer l'animation
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);

      // Messages d'erreur plus spécifiques
      let errorMessage = "Échec de la connexion. Veuillez vérifier vos informations et réessayer.";

      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect. Veuillez réessayer.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion avec Google
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      toast({
        title: "Connexion avec Google",
        description: "Redirection vers Google...",
        variant: "default",
      });

      const { error } = await signInWithGoogle();

      if (error) {
        throw error;
      }

      // Note: La redirection est gérée par Supabase OAuth
    } catch (error: any) {
      console.error("Google sign in error:", error);

      let errorMessage = "Échec de la connexion avec Google. Veuillez réessayer.";

      if (error.message) {
        if (error.message.includes("popup")) {
          errorMessage = "La fenêtre de connexion a été bloquée. Veuillez autoriser les popups pour ce site.";
        } else if (error.message.includes("network")) {
          errorMessage = "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur de connexion Google",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification du code 2FA
  const handle2FAVerify = async (code: string) => {
    try {
      setIsLoading(true);
      const success = await verify2FA(code);

      if (success) {
        toast({
          title: "Vérification réussie",
          description: "Authentification à deux facteurs validée.",
          variant: "default",
        });

        setShow2FA(false);

        // Redirection avec un léger délai pour montrer l'animation
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);

        return true;
      }

      toast({
        title: "Code incorrect",
        description: "Le code saisi n'est pas valide. Veuillez réessayer.",
        variant: "destructive",
      });

      return false;
    } catch (error) {
      console.error("2FA verification error:", error);

      toast({
        title: "Erreur de vérification",
        description: "Une erreur s'est produite lors de la vérification du code. Veuillez réessayer.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Annulation de la vérification 2FA
  const handle2FACancel = () => {
    setShow2FA(false);
    toast({
      title: "Vérification annulée",
      description: "Vous pouvez réessayer de vous connecter.",
      variant: "default",
    });
  };

  // Navigation vers la page Premium
  const handlePremiumClick = () => {
    navigate("/premium");
  };

  // Connexion rapide en mode développement
  const handleDevLogin = () => {
    toast({
      title: "Mode développement",
      description: "Accès rapide au tableau de bord.",
      variant: "default",
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>{t("signIn")} | Naat</title>
      </Helmet>

      <AnimatePresence mode="wait">
        {show2FA ? (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="sm:mx-auto sm:w-full sm:max-w-md"
          >
            <TwoFactorAuth
              onVerify={handle2FAVerify}
              onCancel={handle2FACancel}
              email={email}
            />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="sm:mx-auto sm:w-full sm:max-w-md"
          >
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {t("signIn")}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t("signInPrompt")}
                <Link to="/signup" className="font-medium text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple ml-1">
                  {t("signUp")}
                </Link>
              </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("email")}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("password")}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-tontine-purple focus:ring-tontine-purple border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Se souvenir de moi
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link to="/forgot-password" className="font-medium text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">
                        {t("forgotPassword")}
                      </Link>
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tontine-purple hover:bg-tontine-dark-purple transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connexion en cours...
                        </>
                      ) : t("signIn")}
                    </Button>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Ou continuer avec
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                          </g>
                        </svg>
                        Google
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="mt-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      onClick={handlePremiumClick}
                      className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 transition-all duration-200"
                    >
                      <Sparkles className="h-5 w-5" />
                      Passé à Premium
                    </Button>
                  </motion.div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleDevLogin}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                    >
                      Mode Développement - Accès Rapide
                    </Button>
                  </div>
                )}

                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>Pour tester l'authentification à deux facteurs, utilisez un email contenant "2fa" ou "secure"</p>
                  <p className="mt-1">Code de test: 123456</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
