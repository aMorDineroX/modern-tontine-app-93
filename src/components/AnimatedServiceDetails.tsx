import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, BarChart3, Globe, User, ArrowLeft, Info, CreditCard, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceWithFeatures, subscribeToService } from "@/services/serviceManagementService";
import { PromoCodeValidation } from "@/services/promoCodeService";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PromoCodeInput from "./PromoCodeInput";
import { Separator } from "@/components/ui/separator";

interface AnimatedServiceDetailsProps {
  service: ServiceWithFeatures;
  isSubscribed?: boolean;
  onBack?: () => void;
  onSubscriptionChange?: () => void;
}

/**
 * Composant amélioré pour afficher les détails d'un service avec des animations
 *
 * @component
 * @param {AnimatedServiceDetailsProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant AnimatedServiceDetails
 */
export default function AnimatedServiceDetails({
  service,
  isSubscribed = false,
  onBack,
  onSubscriptionChange
}: AnimatedServiceDetailsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [promoCodeValidation, setPromoCodeValidation] = useState<PromoCodeValidation | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(service.price);
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

  // Fonction pour calculer la remise et mettre à jour le prix final
  const handleValidPromoCode = (validation: PromoCodeValidation) => {
    setPromoCodeValidation(validation);

    if (validation.is_valid) {
      let discountAmount = 0;

      if (validation.discount_type === 'percentage' && validation.discount_value !== null) {
        discountAmount = service.price * (validation.discount_value / 100);

        // Appliquer le montant maximum de remise si nécessaire
        if (validation.max_discount_amount !== null && discountAmount > validation.max_discount_amount) {
          discountAmount = validation.max_discount_amount;
        }
      } else if (validation.discount_type === 'fixed_amount' && validation.discount_value !== null) {
        discountAmount = validation.discount_value;

        // S'assurer que la remise ne dépasse pas le montant total
        if (discountAmount > service.price) {
          discountAmount = service.price;
        }
      }

      // Mettre à jour le prix final
      setFinalPrice(service.price - discountAmount);
    } else {
      // Réinitialiser le prix final
      setFinalPrice(service.price);
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
      // Ajouter le code promotionnel à la référence de paiement si applicable
      let paymentReference = details.id;
      if (promoCodeValidation?.is_valid && promoCodeValidation.promo_code_id) {
        paymentReference = `${details.id}|promo:${promoCodeValidation.promo_code_id}`;
      }

      const { success, error } = await subscribeToService(
        user.id,
        service.id,
        'paypal',
        paymentReference
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

  // Animations
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 500
      }
    }
  };

  const tabsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.4 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.5 + (i * 0.05),
        duration: 0.3
      }
    })
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.6 }
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

  return (
    <div className="space-y-6">
      {onBack && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </motion.div>
      )}

      <motion.div
        className="flex items-center space-x-4"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={iconVariants}>
          {getServiceIcon(service.icon)}
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">{service.name}</h2>
          <p className="text-gray-500">{service.description}</p>
        </div>
        {isSubscribed && (
          <motion.div variants={badgeVariants} className="ml-auto">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Abonné
            </Badge>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={tabsVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="pricing">Tarification</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="overview" className="space-y-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
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
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Fonctionnalités principales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {service.features
                          .filter(feature => feature.is_highlighted)
                          .map((feature, i) => (
                            <motion.li
                              key={feature.id}
                              className="flex items-start"
                              variants={listItemVariants}
                              custom={i}
                              initial="hidden"
                              animate="visible"
                            >
                              <Check className="h-5 w-5 mr-2 text-green-500" />
                              <div>
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                              </div>
                            </motion.li>
                          ))
                        }
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <motion.div
                        className="w-full"
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("features")}
                        >
                          Voir toutes les fonctionnalités
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle>Toutes les fonctionnalités</CardTitle>
                      <CardDescription>Liste complète des fonctionnalités incluses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.features.map((feature, i) => (
                          <motion.li
                            key={feature.id}
                            className="flex items-start"
                            variants={listItemVariants}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                          >
                            <Check className={`h-5 w-5 mr-2 ${feature.is_highlighted ? 'text-green-500' : 'text-gray-400'}`} />
                            <div>
                              <p className={`${feature.is_highlighted ? 'font-medium' : ''}`}>
                                {feature.name}
                              </p>
                              <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tarification</CardTitle>
                      <CardDescription>Détails de la tarification et options de paiement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        className="text-center p-6 border rounded-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                      >
                        {promoCodeValidation?.is_valid ? (
                          <>
                            <div className="flex items-center justify-center space-x-2">
                              <p className="text-3xl font-bold">
                                {formatAmount(finalPrice)}
                              </p>
                              <p className="text-lg line-through text-gray-400">
                                {formatAmount(service.price)}
                              </p>
                            </div>
                            <p className="text-green-600 font-medium text-sm mt-1">
                              Économisez {formatAmount(service.price - finalPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-3xl font-bold">
                            {formatAmount(service.price)}
                          </p>
                        )}
                        <p className="text-gray-500 mt-1">
                          {service.is_recurring
                            ? `Facturation ${formatRecurringInterval(service.recurring_interval)}`
                            : 'Paiement unique'
                          }
                        </p>
                      </motion.div>

                      {!isSubscribed && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <PromoCodeInput
                            serviceId={service.id}
                            amount={service.price}
                            onValidPromoCode={handleValidPromoCode}
                          />
                        </motion.div>
                      )}

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <p className="font-medium">Ce qui est inclus:</p>
                        <ul className="space-y-1">
                          {service.features.map((feature, i) => (
                            <motion.li
                              key={feature.id}
                              className="flex items-center"
                              variants={listItemVariants}
                              custom={i}
                              initial="hidden"
                              animate="visible"
                            >
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              <span>{feature.name}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                      {!isSubscribed ? (
                        <>
                          <motion.div
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-full"
                          >
                            <PaymentMethodSelector
                              amount={finalPrice}
                              description={`Abonnement à ${service.name}${promoCodeValidation?.is_valid ? ' avec remise' : ''}`}
                              onSuccess={handlePaymentSuccess}
                            />
                          </motion.div>
                          <p className="text-xs text-center text-gray-500 mt-4">
                            En vous abonnant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                          </p>
                        </>
                      ) : (
                        <motion.div
                          variants={buttonVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          whileTap="tap"
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            Gérer l'abonnement
                          </Button>
                        </motion.div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
