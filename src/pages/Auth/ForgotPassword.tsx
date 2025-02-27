
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tontine-text-gradient mb-4">Tontine</h1>
          <p className="text-gray-600 dark:text-gray-400">Réinitialiser votre mot de passe</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          {!submitted ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
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
                      onChange={(e) => setEmail(e.target.value)}
                      className="tontine-input pl-10 w-full text-gray-900 dark:text-gray-100"
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="tontine-button tontine-button-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="bg-tontine-light-purple/20 text-tontine-dark-purple dark:bg-tontine-purple/20 dark:text-tontine-light-purple p-3 rounded-full inline-flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Vérifiez votre email</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nous avons envoyé un lien de réinitialisation à {email}
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
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-sm text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
