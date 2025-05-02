import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import MobileOptimizedLayout from "@/components/MobileOptimizedLayout";
import EnhancedNotificationCenter from "@/components/EnhancedNotificationCenter";
import UserAchievements from "@/components/UserAchievements";
import EnhancedPaymentSystem from "@/components/EnhancedPaymentSystem";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import EnhancedChatSystem from "@/components/EnhancedChatSystem";
import FeedbackDialog from "@/components/FeedbackDialog";
import FeedbackStats from "@/components/FeedbackStats";
import {
  Bell,
  Trophy,
  CreditCard,
  BarChart3,
  MessageSquare,
  Smartphone,
  ArrowRight,
  MessageCircle
} from "lucide-react";

export default function EnhancedFeatures() {
  const [activeTab, setActiveTab] = useState<string>("mobile");
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useApp();

  // Données de démonstration pour les graphiques
  const analyticsData = [
    { name: 'Jan', value: 400 },
    { name: 'Fév', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Avr', value: 800 },
    { name: 'Mai', value: 500 },
    { name: 'Juin', value: 900 },
    { name: 'Juil', value: 1100 },
  ];

  const pieData = [
    { name: 'Épargne', value: 400 },
    { name: 'Investissement', value: 300 },
    { name: 'Dépenses', value: 300 },
    { name: 'Revenus', value: 200 },
  ];

  const handlePaymentComplete = (reference: string) => {
    toast({
      title: "Paiement réussi",
      description: `Référence de paiement: ${reference}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Fonctionnalités améliorées | Naat</title>
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Fonctionnalités améliorées
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Découvrez les nouvelles fonctionnalités avancées de Naat
          </p>
        </div>

        <Tabs defaultValue="mobile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="mobile" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Réalisations</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Paiement</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analyses</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Optimisation mobile</CardTitle>
                  <CardDescription>
                    Adaptez votre interface en fonction de la taille de l'écran
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileOptimizedLayout
                    mobileView={
                      <div className="bg-primary/10 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium mb-2">Vue mobile</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cette vue est optimisée pour les appareils mobiles avec une interface simplifiée.
                        </p>
                      </div>
                    }
                    desktopView={
                      <div className="bg-secondary/10 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium mb-2">Vue bureau</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cette vue est optimisée pour les écrans plus larges avec plus de fonctionnalités visibles.
                        </p>
                      </div>
                    }
                  >
                    <p className="text-sm text-gray-500 mt-4">
                      Redimensionnez votre navigateur pour voir le changement entre les vues mobile et bureau.
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        Tester la réactivité
                      </Button>
                    </div>
                  </MobileOptimizedLayout>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comment ça marche</CardTitle>
                  <CardDescription>
                    Utilisation du composant MobileOptimizedLayout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto">
{`import MobileOptimizedLayout from "@/components/MobileOptimizedLayout";

<MobileOptimizedLayout
  mobileView={<MobileComponent />}
  desktopView={<DesktopComponent />}
>
  <CommonContent />
</MobileOptimizedLayout>`}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Avantages :</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                      <li>Interface adaptative sans media queries complexes</li>
                      <li>Meilleure expérience utilisateur sur tous les appareils</li>
                      <li>Composants optimisés pour chaque taille d'écran</li>
                      <li>Réutilisable dans toute l'application</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Système de notifications avancé</CardTitle>
                    <CardDescription>
                      Recevez des notifications en temps réel pour rester informé
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le système de notifications avancé vous permet de :
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                        <li>Recevoir des notifications en temps réel</li>
                        <li>Filtrer par type (info, succès, avertissement, erreur)</li>
                        <li>Marquer comme lu individuellement ou en masse</li>
                        <li>Accéder rapidement aux actions associées</li>
                      </ul>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Nouvelle notification",
                              description: "Ceci est une notification de test",
                            });
                          }}
                        >
                          Tester une notification
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Succès",
                              description: "Opération réussie",
                              variant: "default",
                            });
                          }}
                        >
                          Notification de succès
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Erreur",
                              description: "Une erreur est survenue",
                              variant: "destructive",
                            });
                          }}
                        >
                          Notification d'erreur
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implémentation</CardTitle>
                    <CardDescription>
                      Comment intégrer le système de notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto">
{`// Abonnement aux notifications
useEffect(() => {
  const subscription = subscribeToUserNotifications(
    userId,
    (notification) => {
      // Traiter la nouvelle notification
    }
  );

  return () => subscription.unsubscribe();
}, [userId]);

// Marquer comme lu
await markNotificationAsRead(notificationId);

// Créer une notification
await createNotification({
  user_id: userId,
  title: "Nouveau message",
  message: "Vous avez reçu un nouveau message",
  type: "info",
  read: false,
  action_url: "/messages"
});`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <EnhancedNotificationCenter />
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UserAchievements />

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Système de gamification</CardTitle>
                    <CardDescription>
                      Engagez vos utilisateurs avec des récompenses et des défis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le système de gamification permet de :
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                        <li>Attribuer des points pour diverses actions</li>
                        <li>Débloquer des réalisations basées sur l'activité</li>
                        <li>Progresser à travers différents niveaux</li>
                        <li>Motiver les utilisateurs à utiliser l'application régulièrement</li>
                      </ul>

                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Points attribués",
                              description: "Vous avez gagné 50 points pour votre activité",
                            });
                          }}
                        >
                          Simuler l'attribution de points
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implémentation</CardTitle>
                    <CardDescription>
                      Comment intégrer le système de gamification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto">
{`// Attribuer des points
const { data } = await awardPoints(
  userId,
  50,
  "Création d'un nouveau groupe"
);

// Vérifier les réalisations
const { data: newAchievements } =
  await checkAndAwardAchievements(userId);

// Obtenir le niveau de l'utilisateur
const { data: userLevel } = await getUserLevel(userId);

// Afficher la progression
<Progress
  value={userLevel.progress_percentage}
  className="h-2"
/>`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Système de paiement amélioré</CardTitle>
                    <CardDescription>
                      Offrez plusieurs options de paiement à vos utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le système de paiement amélioré permet de :
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                        <li>Accepter les paiements par carte bancaire</li>
                        <li>Intégrer PayPal pour des paiements rapides</li>
                        <li>Proposer des virements bancaires</li>
                        <li>Gérer les abonnements récurrents</li>
                        <li>Sécuriser les transactions</li>
                      </ul>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Pour une intégration complète, vous devrez configurer :
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                          <li>Un compte Stripe ou PayPal Business</li>
                          <li>Les webhooks pour les notifications de paiement</li>
                          <li>La gestion des remboursements</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implémentation</CardTitle>
                    <CardDescription>
                      Comment intégrer le système de paiement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto">
{`<EnhancedPaymentSystem
  amount={99.99}
  currency="EUR"
  description="Abonnement Premium"
  onPaymentComplete={(reference) => {
    // Traiter le paiement réussi
    console.log("Paiement réussi:", reference);

    // Mettre à jour l'abonnement de l'utilisateur
    updateUserSubscription(userId, {
      plan: "premium",
      payment_reference: reference,
      start_date: new Date(),
      end_date: addMonths(new Date(), 1)
    });
  }}
/>`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <EnhancedPaymentSystem
                amount={99.99}
                currency="EUR"
                description="Abonnement Premium - Accès à toutes les fonctionnalités"
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AdvancedAnalytics
                data={analyticsData}
                title="Évolution des contributions"
                description="Suivi mensuel des contributions des membres"
                dataKey="value"
                nameKey="name"
                onRefresh={() => {
                  toast({
                    title: "Données actualisées",
                    description: "Les données ont été mises à jour",
                  });
                }}
                onDownload={() => {
                  toast({
                    title: "Téléchargement",
                    description: "Les données ont été téléchargées au format CSV",
                  });
                }}
              />

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Analyses avancées</CardTitle>
                    <CardDescription>
                      Visualisez vos données avec des graphiques interactifs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le système d'analyses avancées permet de :
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                        <li>Visualiser les données avec différents types de graphiques</li>
                        <li>Filtrer par période (semaine, mois, trimestre, année)</li>
                        <li>Exporter les données pour analyse externe</li>
                        <li>Suivre les tendances et les performances</li>
                      </ul>

                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTab("analytics");
                          }}
                        >
                          Actualiser les graphiques
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <AdvancedAnalytics
                  data={pieData}
                  title="Répartition des fonds"
                  description="Distribution des fonds par catégorie"
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[600px]">
                <EnhancedChatSystem
                  receiverId={user?.id || "user-123"}
                  title="Démonstration du chat"
                />
              </div>

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Système de chat amélioré</CardTitle>
                    <CardDescription>
                      Communiquez en temps réel avec vos membres
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le système de chat amélioré permet de :
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
                        <li>Envoyer et recevoir des messages en temps réel</li>
                        <li>Partager des fichiers et des images</li>
                        <li>Voir les indicateurs de lecture et de frappe</li>
                        <li>Organiser les conversations par date</li>
                        <li>Communiquer en groupe ou en privé</li>
                      </ul>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Fonctionnalités supplémentaires :
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                          <li>Notifications push pour les nouveaux messages</li>
                          <li>Recherche dans l'historique des conversations</li>
                          <li>Appels audio et vidéo (à venir)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implémentation</CardTitle>
                    <CardDescription>
                      Comment intégrer le système de chat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto">
{`// Chat privé
<EnhancedChatSystem
  receiverId="user-123"
  title="Chat avec John Doe"
/>

// Chat de groupe
<EnhancedChatSystem
  groupId="group-456"
  isGroupChat={true}
  title="Groupe Tontine Familiale"
/>

// Chat flottant
<FloatingChat
  title="Support Naat"
  subtitle="Nous sommes là pour vous aider"
  isOpen={isOpen}
  unreadCount={unreadCount}
  onToggle={toggleChat}
  onClose={closeChat}
/>`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Votre avis sur ces nouvelles fonctionnalités
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <FeedbackStats
              featureId="enhanced-features"
              featureName="Fonctionnalités améliorées"
            />

            <Card>
              <CardHeader>
                <CardTitle>Partagez votre expérience</CardTitle>
                <CardDescription>
                  Votre avis nous aide à améliorer continuellement l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous sommes constamment à la recherche de moyens d'améliorer votre expérience avec Naat.
                  Vos commentaires sont essentiels pour nous aider à identifier ce qui fonctionne bien et
                  ce qui pourrait être amélioré.
                </p>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Évaluez les nouvelles fonctionnalités</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Suggérez des améliorations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Signalez des problèmes</span>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <FeedbackDialog
                    featureId="enhanced-features"
                    featureName="Fonctionnalités améliorées"
                    buttonVariant="default"
                    buttonSize="lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Prêt à améliorer votre expérience Naat ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Ces fonctionnalités avancées sont disponibles dès maintenant. Intégrez-les à votre application pour offrir une expérience utilisateur exceptionnelle.
          </p>
          <Button className="mr-4">
            Voir la documentation
          </Button>
          <Button variant="outline">
            Explorer d'autres fonctionnalités
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
