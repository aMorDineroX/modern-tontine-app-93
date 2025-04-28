import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { getUserActiveSubscriptions, cancelServiceSubscription, ServiceSubscription } from "@/services/serviceManagementService";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserSubscriptionsProps {
  limit?: number;
  showManageButton?: boolean;
  onManageClick?: () => void;
  className?: string;
}

/**
 * Composant pour afficher les abonnements d'un utilisateur
 * 
 * @component
 * @param {UserSubscriptionsProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant UserSubscriptions
 */
export default function UserSubscriptions({
  limit,
  showManageButton = true,
  onManageClick,
  className = ""
}: UserSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSubscription, setSelectedSubscription] = useState<ServiceSubscription | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { formatAmount } = useApp();
  const { toast } = useToast();
  
  // Charger les abonnements
  const loadSubscriptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { success, data, error } = await getUserActiveSubscriptions(user.id);
      
      if (!success) {
        throw error;
      }
      
      let filteredSubscriptions = data || [];
      
      // Limiter le nombre d'abonnements si nécessaire
      if (limit && filteredSubscriptions.length > limit) {
        filteredSubscriptions = filteredSubscriptions.slice(0, limit);
      }
      
      setSubscriptions(filteredSubscriptions);
    } catch (error) {
      console.error("Erreur lors du chargement des abonnements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos abonnements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadSubscriptions();
  }, [user, limit, toast]);
  
  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  };
  
  // Gérer l'annulation d'un abonnement
  const handleCancelSubscription = async () => {
    if (!user || !selectedSubscription) return;
    
    try {
      const { success, error } = await cancelServiceSubscription(
        user.id,
        selectedSubscription.id
      );
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement a été annulé avec succès",
      });
      
      // Recharger les abonnements
      await loadSubscriptions();
      
      // Fermer la boîte de dialogue
      setIsCancelDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'abonnement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de l'abonnement",
        variant: "destructive",
      });
    }
  };
  
  // Afficher un message si aucun abonnement n'est disponible
  if (!isLoading && subscriptions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mes abonnements</CardTitle>
          <CardDescription>Gérez vos abonnements aux services Naat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Vous n'avez aucun abonnement actif pour le moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Mes abonnements</CardTitle>
          <CardDescription>Gérez vos abonnements aux services Naat</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(limit || 2)].map((_, index) => (
                <Skeleton key={index} className="h-[100px] w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map(subscription => {
                const service = subscription.services;
                return (
                  <div 
                    key={subscription.id} 
                    className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{service.name}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Actif
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CreditCard className="h-4 w-4 mr-1" />
                          {formatAmount(service.price)}
                          {service.is_recurring ? ` / ${service.recurring_interval}` : ''}
                        </div>
                        
                        {subscription.next_payment_date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Prochain paiement: {formatDate(subscription.next_payment_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setIsCancelDialogOpen(true);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                );
              })}
              
              {showManageButton && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline"
                    onClick={onManageClick}
                  >
                    Gérer tous mes abonnements
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler votre abonnement à {selectedSubscription?.services.name} ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start space-x-3 p-4 bg-amber-50 text-amber-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium">Attention</p>
                <p className="text-sm">
                  En annulant votre abonnement, vous perdrez l'accès à toutes les fonctionnalités premium à la fin de la période de facturation en cours.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
            >
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
