import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, BarChart3, Globe, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Service, ServiceFeature } from "@/services/serviceManagementService";

interface AnimatedServiceCardProps {
  service: Service & { features?: ServiceFeature[] };
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  onViewDetails?: () => void;
  showFeatures?: boolean;
  className?: string;
  index?: number; // Pour l'animation séquentielle
}

/**
 * Composant pour afficher un service sous forme de carte avec des animations
 * 
 * @component
 * @param {AnimatedServiceCardProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant AnimatedServiceCard
 */
export default function AnimatedServiceCard({
  service,
  isSubscribed = false,
  onSubscribe,
  onViewDetails,
  showFeatures = false,
  className = "",
  index = 0
}: AnimatedServiceCardProps) {
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
  
  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { 
        delay: index * 0.1 + 0.2,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };
  
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: index * 0.1 + 0.3,
        type: "spring",
        stiffness: 500
      }
    }
  };
  
  const priceVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: index * 0.1 + 0.4,
        duration: 0.5
      }
    }
  };
  
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: index * 0.1 + 0.5,
        duration: 0.5
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };
  
  const featureItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: index * 0.1 + 0.3 + (i * 0.05),
        duration: 0.3
      }
    })
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`w-full ${className}`}
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div variants={iconVariants}>
                {getServiceIcon(service.icon)}
              </motion.div>
              <CardTitle>{service.name}</CardTitle>
            </div>
            {isSubscribed && (
              <motion.div variants={badgeVariants}>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Abonné
                </Badge>
              </motion.div>
            )}
          </div>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <motion.div variants={priceVariants} className="mb-4">
            <p className="text-2xl font-bold">
              {formatAmount(service.price)}
              <span className="text-sm font-normal text-gray-500">
                {service.is_recurring ? formatRecurringInterval(service.recurring_interval) : ''}
              </span>
            </p>
          </motion.div>
          
          {showFeatures && service.features && service.features.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Fonctionnalités incluses:</p>
              <ul className="space-y-1">
                {service.features.map((feature, i) => (
                  <motion.li 
                    key={feature.id} 
                    className="flex items-start"
                    variants={featureItemVariants}
                    custom={i}
                  >
                    <Check className={`h-4 w-4 mr-2 mt-0.5 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={feature.is_highlighted ? 'font-medium' : ''}>
                      {feature.name}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {!isSubscribed ? (
            <motion.div 
              className="w-full" 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                className="w-full" 
                onClick={onSubscribe}
              >
                S'abonner
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="w-full" 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onSubscribe}
              >
                Gérer l'abonnement
              </Button>
            </motion.div>
          )}
          
          {onViewDetails && (
            <motion.div 
              className="w-full" 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onViewDetails}
              >
                Voir les détails
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
