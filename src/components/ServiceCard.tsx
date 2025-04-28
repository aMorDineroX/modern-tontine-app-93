import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, BarChart3, Globe, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Service, ServiceFeature } from "@/services/serviceManagementService";

interface ServiceCardProps {
  service: Service & { features?: ServiceFeature[] };
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  onViewDetails?: () => void;
  showFeatures?: boolean;
  className?: string;
}

/**
 * Composant pour afficher un service sous forme de carte
 * 
 * @component
 * @param {ServiceCardProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServiceCard
 */
export default function ServiceCard({
  service,
  isSubscribed = false,
  onSubscribe,
  onViewDetails,
  showFeatures = false,
  className = ""
}: ServiceCardProps) {
  const { formatAmount } = useApp();
  
  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-blue-500" />;
      case 'chart-bar':
        return <BarChart3 className="h-6 w-6 text-green-500" />;
      case 'globe':
        return <Globe className="h-6 w-6 text-purple-500" />;
      case 'user':
        return <User className="h-6 w-6 text-orange-500" />;
      default:
        return <Crown className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Fonction pour formater l'intervalle de récurrence
  const formatRecurringInterval = (interval: string | null) => {
    if (!interval) return '';
    
    switch (interval) {
      case 'day':
        return '/jour';
      case 'week':
        return '/semaine';
      case 'month':
        return '/mois';
      case 'year':
        return '/an';
      default:
        return '';
    }
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getServiceIcon(service.icon)}
            <CardTitle>{service.name}</CardTitle>
          </div>
          {isSubscribed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Abonné
            </Badge>
          )}
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <p className="text-2xl font-bold">
            {formatAmount(service.price)}
            <span className="text-sm font-normal text-gray-500">
              {service.is_recurring ? formatRecurringInterval(service.recurring_interval) : ''}
            </span>
          </p>
        </div>
        
        {showFeatures && service.features && service.features.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">Fonctionnalités incluses:</p>
            <ul className="space-y-1">
              {service.features.map((feature) => (
                <li key={feature.id} className="flex items-start">
                  <Check className={`h-4 w-4 mr-2 mt-0.5 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={feature.is_highlighted ? 'font-medium' : ''}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        {!isSubscribed ? (
          <Button 
            className="w-full" 
            onClick={onSubscribe}
          >
            S'abonner
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onSubscribe}
          >
            Gérer l'abonnement
          </Button>
        )}
        
        {onViewDetails && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onViewDetails}
          >
            Voir les détails
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
