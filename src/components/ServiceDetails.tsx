import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, BarChart3, Globe, User, ArrowLeft, Info, CreditCard, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceWithFeatures, subscribeToService } from "@/services/serviceManagementService";
import PayPalCheckoutButton from "./PayPalCheckoutButton";

interface ServiceDetailsProps {
  service: ServiceWithFeatures;
  isSubscribed?: boolean;
  onBack?: () => void;
  onSubscriptionChange?: () => void;
}

/**
 * Composant pour afficher les détails d'un service
 * 
 * @component
 * @param {ServiceDetailsProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServiceDetails
 */
export default function ServiceDetails({
  service,
  isSubscribed = false,
  onBack,
  onSubscriptionChange
}: ServiceDetailsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { formatAmount } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 'shield':
        return <Shield className="h-8 w-8 text-blue-500" />;
      case 'chart-bar':
        return <BarChart3 className="h-8 w-8 text-green-500" />;
      case 'globe':
        return <Globe className="h-8 w-8 text-purple-500" />;
      case 'user':
        return <User className="h-8 w-8 text-orange-500" />;
      default:
        return <Crown className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Fonction pour formater l'intervalle de récurrence
  const formatRecurringInterval = (interval: string | null) => {
    if (!interval) return '';
    
    switch (interval) {
      case 'day':
        return 'par jour';
      case 'week':
        return 'par semaine';
      case 'month':
        return 'par mois';
      case 'year':
        return 'par an';
      default:
        return '';
    }
  };
  
  // Fonction pour gérer le paiement réussi
  const handlePaymentSuccess = async (details: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour vous abonner à un service",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { success, error } = await subscribeToService(
        user.id,
        service.id,
        'paypal',
        details.id
      );
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Abonnement réussi",
        description: `Vous êtes maintenant abonné à ${service.name}`,
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error("Erreur lors de l'abonnement au service:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'abonnement au service",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {onBack && (
        <Button 
          variant="ghost" 
          className="flex items-center text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      )}
      
      <div className="flex items-center space-x-4">
        {getServiceIcon(service.icon)}
        <div>
          <h2 className="text-2xl font-bold">{service.name}</h2>
          <p className="text-gray-500">{service.description}</p>
        </div>
        {isSubscribed && (
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
            Abonné
          </Badge>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="pricing">Tarification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>À propos de {service.name}</CardTitle>
              <CardDescription>Tout ce que vous devez savoir sur ce service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-gray-500">{service.description}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tarification</p>
                  <p className="text-gray-500">
                    {formatAmount(service.price)}
                    {service.is_recurring ? ` ${formatRecurringInterval(service.recurring_interval)}` : ' (paiement unique)'}
                  </p>
                </div>
              </div>
              
              {service.is_recurring && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Facturation</p>
                    <p className="text-gray-500">
                      Facturation {formatRecurringInterval(service.recurring_interval)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités principales</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.features
                  .filter(feature => feature.is_highlighted)
                  .map(feature => (
                    <li key={feature.id} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab("features")}
              >
                Voir toutes les fonctionnalités
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les fonctionnalités</CardTitle>
              <CardDescription>Liste complète des fonctionnalités incluses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {service.features.map(feature => (
                  <li key={feature.id} className="flex items-start">
                    <Check className={`h-5 w-5 mr-2 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`${feature.is_highlighted ? 'font-medium' : ''}`}>
                        {feature.name}
                      </p>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
              <CardDescription>Détails de la tarification et options de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 border rounded-lg">
                <p className="text-3xl font-bold">
                  {formatAmount(service.price)}
                </p>
                <p className="text-gray-500">
                  {service.is_recurring 
                    ? `Facturation ${formatRecurringInterval(service.recurring_interval)}`
                    : 'Paiement unique'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Ce qui est inclus:</p>
                <ul className="space-y-1">
                  {service.features.map(feature => (
                    <li key={feature.id} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {!isSubscribed ? (
                <>
                  <PayPalCheckoutButton
                    amount={service.price}
                    description={`Abonnement à ${service.name}`}
                    onSuccess={handlePaymentSuccess}
                    buttonText="S'abonner avec PayPal"
                  />
                  <p className="text-xs text-center text-gray-500 mt-2">
                    En vous abonnant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </>
              ) : (
                <Button variant="outline" className="w-full">
                  Gérer l'abonnement
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
