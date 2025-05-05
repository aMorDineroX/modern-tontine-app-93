import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserRound, KeyRound, Mail, Facebook, Twitter, Github, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import PasswordStrengthMeter from "@/components/Auth/PasswordStrengthMeter";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordStrength = usePasswordStrength(password, 8);
  const { signUp, signInWithProvider } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier la force du mot de passe
    if (!passwordStrength.isValid) {
      toast({
        title: "Mot de passe trop faible",
        description: passwordStrength.validationErrors.join(". "),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password, fullName, {
        redirectTo: `${window.location.origin}/dashboard`
      });

      toast({
        title: "Compte créé avec succès",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });

      // Rediriger vers la page de connexion avec un message de succès
      navigate("/signin");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
    try {
      setIsSubmitting(true);
      await signInWithProvider(provider);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(`Sign up with ${provider} error:`, error);
      toast({
        title: `Erreur de connexion avec ${provider}`,
        description: error.message || `Une erreur s'est produite lors de la connexion avec ${provider}. Veuillez réessayer.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Helmet>
        <title>{t("signUp")} | Naat</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tontine-text-gradient mb-4">Naat</h1>
          <p className="text-gray-600 dark:text-gray-400">Créez votre compte pour commencer</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound size={18} className="text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                  placeholder="Jean Dupont"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                  placeholder="vous@exemple.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Indicateur de force du mot de passe */}
              <div className="mt-2">
                <PasswordStrengthMeter result={passwordStrength} />
              </div>

              {/* Critères de mot de passe */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-xs">
                  {password.length >= 8 ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={password.length >= 8 ? "text-green-500" : "text-red-500"}>
                    Au moins 8 caractères
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[A-Z]/.test(password) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-red-500"}>
                    Au moins une lettre majuscule
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[a-z]/.test(password) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[a-z]/.test(password) ? "text-green-500" : "text-red-500"}>
                    Au moins une lettre minuscule
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[0-9]/.test(password) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[0-9]/.test(password) ? "text-green-500" : "text-red-500"}>
                    Au moins un chiffre
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[^A-Za-z0-9]/.test(password) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-red-500"}>
                    Au moins un caractère spécial
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              className="tontine-button tontine-button-primary w-full"
              disabled={isSubmitting || !passwordStrength.isValid}
              whileHover={!isSubmitting && passwordStrength.isValid ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && passwordStrength.isValid ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création du compte...
                </>
              ) : "Créer un compte"}
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou inscrivez-vous avec
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => handleSocialSignUp("google")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Google
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSocialSignUp("facebook")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                Facebook
              </motion.button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => handleSocialSignUp("twitter")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <Twitter className="h-5 w-5 mr-2 text-blue-400" />
                Twitter
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSocialSignUp("github")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </motion.button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte?{" "}
              <Link to="/signin" className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-tontine-purple dark:hover:text-tontine-light-purple">
            ← Retour à la page d'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
