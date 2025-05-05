import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import PasswordStrengthMeter from "@/components/Auth/PasswordStrengthMeter";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const passwordStrength = usePasswordStrength(newPassword, 8);
  const { updatePassword } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();

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
      const { error } = await updatePassword(currentPassword, newPassword);

      if (error) {
        throw error;
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      // Réinitialiser les champs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Rediriger vers le profil
      navigate("/profile");
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Helmet>
        <title>Changer le mot de passe | Naat</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tontine-text-gradient mb-4">Naat</h1>
          <p className="text-gray-600 dark:text-gray-400">Changer votre mot de passe</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe actuel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

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
                  Mise à jour en cours...
                </>
              ) : "Mettre à jour le mot de passe"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/profile"
              className="inline-flex items-center text-sm text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple transition-colors duration-200"
            >
              <ArrowLeft size={16} className="mr-1" />
              Retour au profil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
