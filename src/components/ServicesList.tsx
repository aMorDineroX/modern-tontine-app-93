import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAllServices, getUserServices, Service, UserService } from "@/services/serviceManagementService";
import ServiceCard from "./ServiceCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ServiceDetails from "./ServiceDetails";
import { Skeleton } from "@/components/ui/skeleton";

interface ServicesListProps {
  limit?: number;
  showSubscribedOnly?: boolean;
  onServiceClick?: (service: Service) => void;
  className?: string;
}

/**
 * Composant pour afficher la liste des services
 * 
 * @component
 * @param {ServicesListProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant ServicesList
 */
export default function ServicesList({
  limit,
  showSubscribedOnly = false,
  onServiceClick,
  className = ""
}: ServicesListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Charger les services
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        // Charger tous les services
        const { success, data, error } = await getAllServices();
        
        if (!success) {
          throw error;
        }
        
        let filteredServices = data || [];
        
        // Limiter le nombre de services si nécessaire
        if (limit && filteredServices.length > limit) {
          filteredServices = filteredServices.slice(0, limit);
        }
        
        setServices(filteredServices);
        
        // Charger les services de l'utilisateur si connecté
        if (user) {
          const { success: userSuccess, data: userData, error: userError } = await getUserServices(user.id);
          
          if (!userSuccess) {
            throw userError;
          }
          
          setUserServices(userData || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les services",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServices();
  }, [user, limit, toast]);
  
  // Vérifier si l'utilisateur est abonné à un service
  const isSubscribed = (serviceId: number) => {
    return userServices.some(
      userService => 
        userService.service_id === serviceId && 
        userService.subscription_status === 'active'
    );
  };
  
  // Filtrer les services selon les critères
  const filteredServices = showSubscribedOnly
    ? services.filter(service => isSubscribed(service.id))
    : services;
  
  // Gérer le clic sur un service
  const handleServiceClick = (service: Service) => {
    if (onServiceClick) {
      onServiceClick(service);
    } else {
      setSelectedService(service);
      setIsDetailsOpen(true);
    }
  };
  
  // Gérer la fermeture des détails
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedService(null);
  };
  
  // Gérer le changement d'abonnement
  const handleSubscriptionChange = async () => {
    if (!user) return;
    
    try {
      const { success, data, error } = await getUserServices(user.id);
      
      if (!success) {
        throw error;
      }
      
      setUserServices(data || []);
    } catch (error) {
      console.error("Erreur lors du rechargement des services:", error);
    }
  };
  
  // Afficher un message si aucun service n'est disponible
  if (!isLoading && filteredServices.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-500">
          {showSubscribedOnly
            ? "Vous n'êtes abonné à aucun service pour le moment."
            : "Aucun service n'est disponible pour le moment."}
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit || 3)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              isSubscribed={isSubscribed(service.id)}
              onSubscribe={() => handleServiceClick(service)}
              onViewDetails={() => handleServiceClick(service)}
              showFeatures={false}
            />
          ))}
        </div>
      )}
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedService && (
            <ServiceDetails
              service={{...selectedService, features: []}}
              isSubscribed={isSubscribed(selectedService.id)}
              onBack={handleCloseDetails}
              onSubscriptionChange={handleSubscriptionChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
