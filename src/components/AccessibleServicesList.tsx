import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAllServices, getUserServices, Service, UserService } from "@/services/serviceManagementService";
import AccessibleServiceCard from "./AccessibleServiceCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AnimatedServiceDetails from "./AnimatedServiceDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";

interface AccessibleServicesListProps {
  limit?: number;
  showSubscribedOnly?: boolean;
  onServiceClick?: (service: Service) => void;
  className?: string;
}

/**
 * Composant accessible pour afficher la liste des services
 * 
 * @component
 * @param {AccessibleServicesListProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant AccessibleServicesList
 */
const AccessibleServicesList: React.FC<AccessibleServicesListProps> = ({
  limit,
  showSubscribedOnly = false,
  onServiceClick,
  className = ""
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [billingType, setBillingType] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
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
  
  // Filtrer les services
  const getFilteredServices = () => {
    let filtered = services;
    
    // Filtrer par abonnement si nécessaire
    if (showSubscribedOnly) {
      filtered = filtered.filter(service => isSubscribed(service.id));
    }
    
    // Filtrer par recherche
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => {
        switch (selectedCategory) {
          case "premium":
            return service.name.toLowerCase().includes("premium");
          case "insurance":
            return service.name.toLowerCase().includes("assurance");
          case "financial":
            return service.name.toLowerCase().includes("financière") || 
                   service.name.toLowerCase().includes("analyse");
          case "transfer":
            return service.name.toLowerCase().includes("transfert");
          default:
            return true;
        }
      });
    }
    
    // Filtrer par type de facturation
    if (billingType !== "all") {
      filtered = filtered.filter(service => {
        if (billingType === "recurring") {
          return service.is_recurring;
        } else if (billingType === "onetime") {
          return !service.is_recurring;
        }
        return true;
      });
    }
    
    // Mettre à jour les filtres actifs
    const newActiveFilters = [];
    if (searchQuery.trim() !== "") newActiveFilters.push(`Recherche: ${searchQuery}`);
    if (selectedCategory !== "all") {
      const categoryLabels = {
        premium: "Premium",
        insurance: "Assurance",
        financial: "Financier",
        transfer: "Transfert"
      };
      newActiveFilters.push(`Catégorie: ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`);
    }
    if (billingType !== "all") {
      newActiveFilters.push(`Facturation: ${billingType === "recurring" ? "Récurrent" : "Unique"}`);
    }
    
    setActiveFilters(newActiveFilters);
    
    return filtered;
  };
  
  const filteredServices = getFilteredServices();
  
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
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setBillingType("all");
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
  
  // Générer un ID unique pour la liste
  const listId = "services-list";
  const searchId = "services-search";
  const categoryId = "services-category";
  const billingTypeId = "services-billing-type";
  
  return (
    <div className={className}>
      {/* Filtres */}
      <div className="mb-6">
        <div 
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          role="search"
          aria-labelledby="filter-heading"
        >
          <h2 id="filter-heading" className="sr-only">Filtrer les services</h2>
          
          <div className="relative w-full sm:w-auto flex-grow max-w-md">
            <Label htmlFor={searchId} className="sr-only">Rechercher un service</Label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <Input
              id={searchId}
              type="search"
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
              aria-controls={listId}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div>
              <Label htmlFor={categoryId} className="sr-only">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id={categoryId} className="w-full sm:w-[180px]" aria-controls={listId}>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="financial">Financier</SelectItem>
                  <SelectItem value="transfer">Transfert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={billingTypeId} className="sr-only">Type de facturation</Label>
              <Select value={billingType} onValueChange={setBillingType}>
                <SelectTrigger id={billingTypeId} className="w-full sm:w-[180px]" aria-controls={listId}>
                  <SelectValue placeholder="Facturation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="recurring">Récurrent</SelectItem>
                  <SelectItem value="onetime">Paiement unique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Filtres avancés">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres avancés</SheetTitle>
                  <SheetDescription>
                    Affinez votre recherche de services avec des filtres supplémentaires.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="advanced-search">Recherche</Label>
                    <Input
                      id="advanced-search"
                      type="text"
                      placeholder="Rechercher un service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advanced-category">Catégorie</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="advanced-category">
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="insurance">Assurance</SelectItem>
                        <SelectItem value="financial">Financier</SelectItem>
                        <SelectItem value="transfer">Transfert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advanced-billing">Type de facturation</Label>
                    <Select value={billingType} onValueChange={setBillingType}>
                      <SelectTrigger id="advanced-billing">
                        <SelectValue placeholder="Facturation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="recurring">Récurrent</SelectItem>
                        <SelectItem value="onetime">Paiement unique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button>Appliquer</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Filtres actifs */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
            <span className="sr-only">Filtres actifs:</span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {filter}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters} 
              className="h-6 px-2 text-xs"
              aria-label="Réinitialiser tous les filtres"
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-busy="true"
          aria-label="Chargement des services..."
        >
          {[...Array(limit || 3)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id={listId}
          role="list"
          aria-label="Liste des services"
          aria-live="polite"
        >
          <AnimatePresence>
            {filteredServices.length === 0 ? (
              <div 
                className="col-span-full p-6 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="text-gray-500">
                  {showSubscribedOnly
                    ? "Vous n'êtes abonné à aucun service pour le moment."
                    : "Aucun service ne correspond à vos critères de recherche."}
                </p>
                {activeFilters.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters} 
                    className="mt-4"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              filteredServices.map((service, index) => (
                <div key={service.id} role="listitem">
                  <AccessibleServiceCard
                    service={service}
                    isSubscribed={isSubscribed(service.id)}
                    onSubscribe={() => handleServiceClick(service)}
                    onViewDetails={() => handleServiceClick(service)}
                    showFeatures={false}
                    index={index}
                  />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedService && (
            <AnimatedServiceDetails
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
};

export default AccessibleServicesList;
