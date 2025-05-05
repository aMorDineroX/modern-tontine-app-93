
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { resetPassword } = useAuth();
  const { t } = useApp();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("L'email est requis");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Format d'email invalide");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setSubmitted(true);
      toast({
        title: "Email envoyé",
        description: "Veuillez vérifier votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi de l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-6">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <AlertCircle size={14} className="inline-block mr-1 mb-1" />
                    Pour des raisons de sécurité, toutes vos sessions actives seront déconnectées lorsque vous demandez une réinitialisation de mot de passe.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        className={`tontine-input pl-10 w-full text-gray-900 dark:text-gray-100 ${
                          emailError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                        }`}
                        placeholder="vous@exemple.com"
                        required
                        disabled={isSubmitting}
                      />
                      {emailError && (
                        <div className="flex items-center mt-1 text-red-500 text-xs">
                          <AlertCircle size={12} className="mr-1" />
                          {emailError}
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="tontine-button tontine-button-primary w-full"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : "Envoyer le lien de réinitialisation"}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center py-4"
              >
                <div className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Vérifiez votre email</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Nous avons envoyé un lien de réinitialisation à <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas reçu l'email? Vérifiez votre dossier spam ou{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple"
                  >
                    essayez à nouveau
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center text-sm text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple transition-colors duration-200"
            >
              <ArrowLeft size={16} className="mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
