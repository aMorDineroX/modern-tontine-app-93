
import { Helmet } from "react-helmet";
import { useApp } from "@/contexts/AppContext";
import { CheckCircle, Crown, CreditCard, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Premium() {
  const { t } = useApp();

  const featuresBasic = [
    { icon: <Users size={18} />, text: "Jusqu'à 3 groupes tontine" },
    { icon: <Users size={18} />, text: "Maximum 10 membres par groupe" },
    { icon: <CreditCard size={18} />, text: "Paiements manuels uniquement" },
    { icon: <Shield size={18} />, text: "Sécurité de base" },
  ];

  const featuresPremium = [
    { icon: <CheckCircle size={18} />, text: "Groupes illimités" },
    { icon: <CheckCircle size={18} />, text: "Membres illimités par groupe" },
    { icon: <CheckCircle size={18} />, text: "Paiements automatiques" },
    { icon: <CheckCircle size={18} />, text: "Notifications avancées" },
    { icon: <CheckCircle size={18} />, text: "Rapports détaillés" },
    { icon: <CheckCircle size={18} />, text: "Sécurité renforcée" },
    { icon: <CheckCircle size={18} />, text: "Support prioritaire" },
    { icon: <CheckCircle size={18} />, text: "Personnalisation avancée" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('premium')} | Naat</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tontine-text-gradient">
            Fonctionnalités Premium
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les avantages exclusifs réservés à nos membres premium pour une gestion optimale de vos tontines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2">Plan Gratuit</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Fonctionnalités de base pour démarrer</p>
              <div className="text-3xl font-bold">
                0€ <span className="text-base font-normal text-gray-500">/mois</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {featuresBasic.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 text-gray-500">{feature.icon}</span>
                    <span className="text-gray-600 dark:text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button variant="outline" className="w-full">
                  Plan actuel
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-tontine-light-green/20 to-primary/20 dark:from-primary/30 dark:to-tontine-light-green/30 rounded-xl shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg">
              <div className="flex items-center">
                <Crown size={16} className="mr-1" />
                <span className="text-sm font-medium">Recommandé</span>
              </div>
            </div>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                Plan Premium
                <Star className="ml-2 text-yellow-400" size={20} />
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Fonctionnalités avancées pour les professionnels</p>
              <div className="text-3xl font-bold text-primary">
                9,99€ <span className="text-base font-normal text-gray-500">/mois</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {featuresPremium.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 text-primary">{feature.icon}</span>
                    <span className="text-gray-600 dark:text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button className="w-full bg-primary hover:bg-primary/80">
                  Passer à Premium
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Ce que disent nos utilisateurs Premium</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">MK</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Marie K.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premium depuis 6 mois</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Les fonctionnalités premium m'ont permis de gérer plus efficacement mes 5 groupes de tontine. Les paiements automatiques sont un gain de temps considérable!"
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">JP</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Jean P.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premium depuis 1 an</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Le support prioritaire a été déterminant pour moi. J'ai toujours des réponses rapides et pertinentes à mes questions."
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-tontine-light-green/20 rounded-full flex items-center justify-center">
                  <span className="text-primary dark:text-tontine-light-green font-bold">SD</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">Sophie D.</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premium depuis 3 mois</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Les rapports détaillés me permettent de mieux suivre l'évolution de mes tontines et d'anticiper les futurs paiements. Excellent investissement!"
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-primary text-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Prêt à passer au niveau supérieur?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Rejoignez nos membres premium et profitez de fonctionnalités exclusives pour une gestion optimale de vos tontines.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            Passer à Premium maintenant
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Questions fréquentes</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-2">Comment passer au plan Premium?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Cliquez simplement sur le bouton "Passer à Premium" et suivez les instructions pour compléter votre paiement. Vous aurez un accès instantané à toutes les fonctionnalités premium.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-2">Puis-je annuler mon abonnement à tout moment?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. Vous continuerez à bénéficier des fonctionnalités premium jusqu'à la fin de votre période de facturation.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-2">Y a-t-il une période d'essai?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Oui, nous offrons une période d'essai de 14 jours pour vous permettre de découvrir toutes les fonctionnalités premium sans engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
