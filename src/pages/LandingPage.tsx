
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Globe, Shield, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageCurrencySelector from "@/components/LanguageCurrencySelector";

export default function LandingPage() {
  const { t } = useApp();
  const [language, setLanguage] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold tontine-text-gradient">Naat</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setLanguage(!language)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Globe size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
                </button>
                {language && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <LanguageCurrencySelector type="language" />
                    </div>
                  </div>
                )}
              </div>
              <ThemeToggle />
              <Link
                to="/signin"
                className="tontine-button tontine-button-secondary"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="tontine-button tontine-button-primary"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tontine-text-gradient">
                Gérez vos groupes d'épargne collectifs facilement
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Notre plateforme de tontine numérique vous permet de créer, gérer et suivre
                vos groupes d'épargne traditionnels avec simplicité et sécurité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/signup"
                  className="tontine-button tontine-button-primary text-center px-8 py-3 text-base"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  to="/signin"
                  className="tontine-button tontine-button-secondary text-center px-8 py-3 text-base"
                >
                  Se connecter
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end relative">
              <div className="w-full max-w-md relative z-10 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                  alt="Tontine App"
                  className="w-full object-cover h-96"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tontine-light-purple rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-tontine-purple rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tontine-text-gradient">Fonctionnalités</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Notre application offre tout ce dont vous avez besoin pour gérer efficacement
              vos tontines traditionnelles dans un environnement moderne.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center mb-6">
                <Users size={24} className="text-primary dark:text-tontine-light-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Gestion de Groupe</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Créez facilement des groupes, invitez des membres et définissez les règles de contribution
                selon vos besoins spécifiques.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-tontine-light-purple/20 rounded-full flex items-center justify-center mb-6">
                <Shield size={24} className="text-tontine-purple dark:text-tontine-light-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Sécurité Garantie</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Protection des données, transparence totale et transactions sécurisées pour
                que vous puissiez épargner en toute confiance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center mb-6">
                <Globe size={24} className="text-primary dark:text-tontine-light-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Multi-devises & Langues</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Utilisez l'application dans votre langue préférée et gérez vos tontines dans
                différentes devises partout dans le monde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tontine-text-gradient">Comment ça marche</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Notre plateforme simplifie la gestion des tontines traditionnelles en quelques étapes simples.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-tontine-light-green rounded-full flex items-center justify-center mb-6 text-white font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Créez votre groupe</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Inscrivez-vous, créez un nouveau groupe de tontine et personnalisez les paramètres
                  selon vos besoins et traditions.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight size={32} className="text-primary dark:text-tontine-light-green" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-tontine-light-green rounded-full flex items-center justify-center mb-6 text-white font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Invitez vos membres</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ajoutez des participants à votre groupe par email ou via les réseaux sociaux
                  et définissez leurs rôles.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight size={32} className="text-primary dark:text-tontine-light-green" />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-tontine-light-green rounded-full flex items-center justify-center mb-6 text-white font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Gérez vos contributions</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Suivez les contributions, recevez des rappels et visualisez le calendrier des
                  versements en toute transparence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tontine-text-gradient">Ils nous font confiance</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez ce que nos utilisateurs disent de notre plateforme de tontine numérique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">AM</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Amadou M.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dakar, Sénégal</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Cette application a transformé la façon dont notre famille gère notre tontine.
                Tout est devenu plus transparent et facile à suivre."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">CK</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Chantal K.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Abidjan, Côte d'Ivoire</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Je gère maintenant trois groupes différents sans difficulté. Les rappels
                automatiques et le suivi des paiements ont changé notre expérience."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">JN</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Jean N.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Douala, Cameroun</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "La capacité à utiliser différentes devises a été cruciale pour notre groupe
                international. L'interface est intuitive et simple à utiliser."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-tontine-dark-green dark:from-tontine-dark-green dark:to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Prêt à transformer votre expérience de tontine?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui gèrent efficacement leurs groupes d'épargne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="tontine-button bg-white text-primary hover:bg-gray-100 text-center px-8 py-3 text-base font-medium rounded-md"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/signin"
              className="tontine-button bg-transparent border border-white text-white hover:bg-white/10 text-center px-8 py-3 text-base font-medium rounded-md"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold tontine-text-gradient mb-4">Naat</div>
              <p className="text-gray-600 dark:text-gray-400">
                La plateforme moderne pour gérer vos groupes d'épargne traditionnels.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 dark:text-white">Navigation</h5>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Accueil</Link></li>
                <li><Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Fonctionnalités</Link></li>
                <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Tarifs</Link></li>
                <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">À propos</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 dark:text-white">Légal</h5>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Conditions d'utilisation</Link></li>
                <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Politique de confidentialité</Link></li>
                <li><Link to="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-tontine-light-green">Politique de cookies</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 dark:text-white">Contact</h5>
              <ul className="space-y-2">
                <li className="text-gray-600 dark:text-gray-400">support@naat-app.com</li>
                <li className="text-gray-600 dark:text-gray-400">+1 (123) 456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Naat App. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
