import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, BarChart3, Globe, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Service, ServiceFeature } from "@/services/serviceManagementService";

interface AccessibleServiceCardProps {
  service: Service & { features?: ServiceFeature[] };
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  onViewDetails?: () => void;
  showFeatures?: boolean;
  className?: string;
  index?: number; // Pour l'animation séquentielle
}

/**
 * Composant accessible pour afficher un service sous forme de carte
 * 
 * @component
 * @param {AccessibleServiceCardProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant AccessibleServiceCard
 */
const AccessibleServiceCard: React.FC<AccessibleServiceCardProps> = ({
  service,
  isSubscribed = false,
  onSubscribe,
  onViewDetails,
  showFeatures = false,
  className = "",
  index = 0
}) => {
  const { formatAmount } = useApp();
  
  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="h-6 w-6 text-yellow-500" aria-hidden="true" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-blue-500" aria-hidden="true" />;
      case 'chart-bar':
        return <BarChart3 className="h-6 w-6 text-green-500" aria-hidden="true" />;
      case 'globe':
        return <Globe className="h-6 w-6 text-purple-500" aria-hidden="true" />;
      case 'user':
        return <User className="h-6 w-6 text-orange-500" aria-hidden="true" />;
      default:
        return <Crown className="h-6 w-6 text-gray-500" aria-hidden="true" />;
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
  
  // Animations
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: index * 0.1, // Animation séquentielle
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };
  
  // Générer un ID unique pour le service
  const serviceId = `service-${service.id}`;
  const descriptionId = `service-${service.id}-description`;
  const priceId = `service-${service.id}-price`;
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`w-full ${className}`}
    >
      <Card 
        className="h-full flex flex-col"
        role="region"
        aria-labelledby={serviceId}
        aria-describedby={descriptionId}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getServiceIcon(service.icon)}
              <CardTitle id={serviceId}>{service.name}</CardTitle>
            </div>
            {isSubscribed && (
              <Badge 
                variant="outline" 
                className="bg-green-50 text-green-700 border-green-200"
                aria-label="Vous êtes abonné à ce service"
              >
                Abonné
              </Badge>
            )}
          </div>
          <CardDescription id={descriptionId}>{service.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="mb-4">
            <p 
              className="text-2xl font-bold"
              id={priceId}
              aria-label={`Prix: ${formatAmount(service.price)}${service.is_recurring ? formatRecurringInterval(service.recurring_interval) : ''}`}
            >
              {formatAmount(service.price)}
              <span className="text-sm font-normal text-gray-500">
                {service.is_recurring ? formatRecurringInterval(service.recurring_interval) : ''}
              </span>
            </p>
          </div>
          
          {showFeatures && service.features && service.features.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Fonctionnalités incluses:</p>
              <ul className="space-y-1" aria-label="Fonctionnalités incluses">
                {service.features.map((feature) => (
                  <li key={feature.id} className="flex items-start">
                    <Check 
                      className={`h-4 w-4 mr-2 mt-0.5 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`}
                      aria-hidden="true"
                    />
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
              aria-label={`S'abonner à ${service.name}`}
            >
              S'abonner
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onSubscribe}
              aria-label={`Gérer votre abonnement à ${service.name}`}
            >
              Gérer l'abonnement
            </Button>
          )}
          
          {onViewDetails && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={onViewDetails}
              aria-label={`Voir les détails de ${service.name}`}
            >
              Voir les détails
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AccessibleServiceCard;
