import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getUserServiceRecommendations, ServiceRecommendation, getRecommendationReasonText } from '@/services/recommendationService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Shield, BarChart3, Globe, User, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ServiceRecommendationsProps {
  onServiceClick?: (serviceId: number) => void;
  className?: string;
  limit?: number;
}

/**
 * Composant pour afficher les recommandations de services
 * 
 * @component
 * @param {ServiceRecommendationsProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServiceRecommendations
 */
const ServiceRecommendations: React.FC<ServiceRecommendationsProps> = ({
  onServiceClick,
  className = "",
  limit = 3
}) => {
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useApp();
  
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { success, data, error } = await getUserServiceRecommendations(user.id, limit);
        
        if (!success) {
          throw error;
        }
        
        setRecommendations(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des recommandations:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les recommandations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecommendations();
  }, [user, limit, toast]);
  
  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      case 'shield':
        return <Shield className="h-5 w-5 text-blue-500" aria-hidden="true" />;
      case 'chart-bar':
        return <BarChart3 className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case 'globe':
        return <Globe className="h-5 w-5 text-purple-500" aria-hidden="true" />;
      case 'user':
        return <User className="h-5 w-5 text-orange-500" aria-hidden="true" />;
      default:
        return <Crown className="h-5 w-5 text-gray-500" aria-hidden="true" />;
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recommandations pour vous</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recommandations pour vous</h2>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {recommendations.map((recommendation) => (
          <motion.div 
            key={recommendation.service_id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(recommendation.service_icon)}
                    <CardTitle className="text-base">{recommendation.service_name}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary border-primary/20 text-xs"
                  >
                    {getRecommendationReasonText(recommendation.recommendation_reason)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm">
                  {recommendation.service_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow">
                <p className="font-semibold">
                  {formatAmount(recommendation.service_price)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {recommendation.service_is_recurring 
                      ? formatRecurringInterval(recommendation.service_recurring_interval) 
                      : ''}
                  </span>
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => onServiceClick && onServiceClick(recommendation.service_id)}
                >
                  <span>Voir les détails</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ServiceRecommendations;
