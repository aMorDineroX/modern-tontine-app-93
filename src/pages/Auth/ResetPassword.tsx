import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import PasswordStrengthMeter from "@/components/Auth/PasswordStrengthMeter";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [tokenError, setTokenError] = useState("");

  const passwordStrength = usePasswordStrength(newPassword, 8);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si nous avons un token de réinitialisation dans l'URL
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Vérifier si nous avons un hash dans l'URL (token de réinitialisation)
        const hash = location.hash;
        const query = new URLSearchParams(location.search);

        console.log("Reset password page loaded with hash:", hash);
        console.log("Reset password page loaded with query:", query.toString());
        console.log("Full URL:", window.location.href);

        // Essayer d'extraire les paramètres du hash si présent
        let hashParams = new URLSearchParams();
        if (hash && hash.length > 1) {
          hashParams = new URLSearchParams(hash.substring(1));
        }

        // Vérifier si nous avons un token de réinitialisation dans l'URL
        const isRecoveryFlow =
          query.has('type') && query.get('type') === 'recovery' ||
          hashParams.has('type') && hashParams.get('type') === 'recovery';

        console.log("Is recovery flow:", isRecoveryFlow);

        // Si nous n'avons pas de token de réinitialisation, essayons quand même de vérifier la session
        if (!isRecoveryFlow && !hash) {
          console.log("No recovery parameters found in URL");
        }

        // Vérifier si nous avons une session active
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          setTokenError("Une erreur s'est produite lors de la vérification de votre session. Veuillez réessayer.");
          setIsProcessingToken(false);
          return;
        }

        // Si nous avons une session, nous pouvons procéder à la réinitialisation
        if (data.session) {
          console.log("Session found, ready to reset password");
          setIsProcessingToken(false);
        } else {
          // Si nous n'avons pas de session, essayons de récupérer le token de l'URL
          console.log("No session found, attempting to recover from URL parameters");

          // Essayer de récupérer le token d'accès du hash
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            console.log("Found access token in URL, attempting to set session");

            try {
              // Essayer de définir la session manuellement avec le token
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (setSessionError) {
                console.error("Error setting session:", setSessionError);
                setTokenError("Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.");
                setIsProcessingToken(false);
              } else {
                console.log("Session set successfully from URL parameters");
                setIsProcessingToken(false);
              }
            } catch (sessionError) {
              console.error("Error setting session:", sessionError);
              setTokenError("Une erreur s'est produite lors de la récupération de votre session. Veuillez demander un nouveau lien.");
              setIsProcessingToken(false);
            }
          } else {
            // Si nous n'avons pas de token d'accès, afficher une erreur
            console.error("No access token found in URL");
            setTokenError("Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.");
            setIsProcessingToken(false);
          }
        }
      } catch (error) {
        console.error("Error processing reset token:", error);
        setTokenError("Une erreur s'est produite lors du traitement du lien de réinitialisation. Veuillez réessayer.");
        setIsProcessingToken(false);
      }
    };

    checkResetToken();
  }, [location]);

  const validateForm = (): boolean => {
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setConfirmError("Les mots de passe ne correspondent pas");
      return false;
    }

    // Vérifier la force du mot de passe
    if (!passwordStrength.isValid) {
      toast({
        title: "Mot de passe trop faible",
        description: passwordStrength.validationErrors.join(". "),
        variant: "destructive",
      });
      return false;
    }

    setConfirmError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("Attempting to update password...");

      // Vérifier d'abord si nous avons une session active
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session before password update:", sessionData.session ? "Present" : "None");

      // Mettre à jour le mot de passe
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error);
        throw error;
      }

      console.log("Password update successful:", data);

      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        duration: 5000,
      });

      // Se déconnecter explicitement pour forcer une nouvelle connexion avec le nouveau mot de passe
      await supabase.auth.signOut();

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Erreur de réinitialisation",
        description: error.message || "Une erreur s'est produite lors de la réinitialisation du mot de passe. Veuillez réessayer.",
        variant: "destructive",
      });

      // Si l'erreur est liée à une session expirée, proposer de demander un nouveau lien
      if (error.message && (
          error.message.includes("expired") ||
          error.message.includes("invalid") ||
          error.message.includes("session")
        )) {
        setTokenError("Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un écran de chargement pendant la vérification du token
  if (isProcessingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tontine-purple mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Vérification du lien de réinitialisation...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le token est invalide
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lien invalide</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tokenError}</p>
          <Button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-tontine-purple hover:bg-tontine-dark-purple text-white"
          >
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Helmet>
        <title>Réinitialiser le mot de passe | Naat</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tontine-text-gradient mb-4">Naat</h1>
          <p className="text-gray-600 dark:text-gray-400">Réinitialiser votre mot de passe</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
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
                  {newPassword.length >= 8 ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={newPassword.length >= 8 ? "text-green-500" : "text-red-500"}>
                    Au moins 8 caractères
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[A-Z]/.test(newPassword) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                    Au moins une lettre majuscule
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[a-z]/.test(newPassword) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                    Au moins une lettre minuscule
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[0-9]/.test(newPassword) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                    Au moins un chiffre
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {/[^A-Za-z0-9]/.test(newPassword) ? (
                    <CheckCircle2 size={14} className="text-green-500 mr-1" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                    Au moins un caractère spécial
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError && e.target.value === newPassword) {
                      setConfirmError("");
                    }
                  }}
                  className={`tontine-input pl-10 w-full text-gray-900 dark:text-gray-100 ${
                    confirmError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
              {confirmError && (
                <div className="flex items-center mt-1 text-red-500 text-xs">
                  <AlertCircle size={12} className="mr-1" />
                  {confirmError}
                </div>
              )}
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
                  Réinitialisation en cours...
                </>
              ) : "Réinitialiser le mot de passe"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
