import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, History, ArrowRight } from "lucide-react";
import ServicesList from "@/components/ServicesList";
import UserSubscriptions from "@/components/UserSubscriptions";
import { useNavigate } from "react-router-dom";

/**
 * Page des services
 * 
 * @component
 * @returns {JSX.Element} Page des services
 */
export default function Services() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Services | Naat</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Découvrez et gérez les services premium pour améliorer votre expérience Naat
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="discover" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Découvrir
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Abonnements
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
            <CardHeader>
              <CardTitle>Améliorez votre expérience Naat</CardTitle>
              <CardDescription>
                Découvrez nos services premium pour tirer le meilleur parti de votre tontine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nos services premium vous offrent des fonctionnalités avancées pour gérer vos tontines plus efficacement, 
                protéger vos investissements et optimiser vos finances.
              </p>
              <div className="mt-4">
                <Button 
                  variant="default" 
                  className="flex items-center"
                  onClick={() => navigate('/premium')}
                >
                  Découvrir Naat Premium
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Services disponibles</h2>
            <ServicesList />
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-6">
          <UserSubscriptions 
            showManageButton={true}
            onManageClick={() => navigate('/transactions/paypal')}
          />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Autres services disponibles</h2>
            <p className="text-sm text-gray-500">
              Découvrez d'autres services qui pourraient vous intéresser
            </p>
            <ServicesList showSubscribedOnly={false} />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>
                Consultez l'historique de vos paiements pour les services Naat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  Consultez toutes vos transactions liées aux services Naat
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/transactions')}
                >
                  Voir toutes les transactions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Services populaires</h2>
            <p className="text-sm text-gray-500">
              Les services les plus populaires auprès de nos utilisateurs
            </p>
            <ServicesList limit={3} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
