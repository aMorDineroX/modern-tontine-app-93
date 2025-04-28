import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getServiceBundles } from '@/services/recommendationService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Shield, BarChart3, Globe, User, ChevronRight, Package, Percent } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ServiceBundlesProps {
  onBundleClick?: (bundleId: number) => void;
  className?: string;
  limit?: number;
}

/**
 * Composant pour afficher les offres groupées de services
 *
 * @component
 * @param {ServiceBundlesProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServiceBundles
 */
const ServiceBundles: React.FC<ServiceBundlesProps> = ({
  onBundleClick,
  className = "",
  limit = 3
}) => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useApp();

  useEffect(() => {
    const loadBundles = async () => {
      setIsLoading(true);
      try {
        const { success, data, error } = await getServiceBundles();

        if (!success) {
          throw error;
        }

        // Limiter le nombre d'offres si nécessaire
        const limitedData = limit ? data?.slice(0, limit) : data;
        setBundles(limitedData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des offres groupées:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les offres groupées",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBundles();
    // Remove toast from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

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
        return <Package className="h-5 w-5 text-gray-500" aria-hidden="true" />;
    }
  };

  // Fonction pour calculer le prix total sans remise
  const calculateTotalPrice = (bundle: any) => {
    let totalPrice = bundle.services.price;

    bundle.bundle_items.forEach((item: any) => {
      totalPrice += item.services.price;
    });

    return totalPrice;
  };

  // Fonction pour calculer le prix avec remise
  const calculateDiscountedPrice = (bundle: any) => {
    const totalPrice = calculateTotalPrice(bundle);
    const discount = totalPrice * (bundle.discount_percentage / 100);
    return totalPrice - discount;
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
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Offres groupées</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(limit)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Skeleton className="h-20 w-full mb-2" />
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

  if (bundles.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Offres groupées</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {bundles.map((bundle) => (
          <motion.div
            key={bundle.id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(bundle.services.icon)}
                    <CardTitle className="text-base">{bundle.name}</CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                  >
                    <Percent className="h-3 w-3" />
                    {bundle.discount_percentage}% de remise
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {bundle.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="services">
                    <AccordionTrigger className="text-sm py-2">
                      Services inclus
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getServiceIcon(bundle.services.icon)}
                            <span>{bundle.services.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatAmount(bundle.services.price)}
                            {bundle.services.is_recurring && (
                              <span className="text-xs text-muted-foreground">
                                /{bundle.services.recurring_interval}
                              </span>
                            )}
                          </span>
                        </li>
                        {bundle.bundle_items.map((item: any) => (
                          <li key={item.service_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getServiceIcon(item.services.icon)}
                              <span>{item.services.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatAmount(item.services.price)}
                              {item.services.is_recurring && (
                                <span className="text-xs text-muted-foreground">
                                  /{item.services.recurring_interval}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Prix total</span>
                    <span className="text-sm line-through">
                      {formatAmount(calculateTotalPrice(bundle))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Prix avec remise</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(calculateDiscountedPrice(bundle))}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => onBundleClick && onBundleClick(bundle.id)}
                >
                  <span>S'abonner à l'offre groupée</span>
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

export default ServiceBundles;
