import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAllServices, getUserServices, Service, UserService } from "@/services/serviceManagementService";
import AnimatedServiceCard from "./AnimatedServiceCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ServiceDetails from "./ServiceDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

interface EnhancedServicesListProps {
  limit?: number;
  showSubscribedOnly?: boolean;
  onServiceClick?: (service: Service) => void;
  className?: string;
}

/**
 * Composant amélioré pour afficher la liste des services avec animations et filtres
 * 
 * @component
 * @param {EnhancedServicesListProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant EnhancedServicesList
 */
export default function EnhancedServicesList({
  limit,
  showSubscribedOnly = false,
  onServiceClick,
  className = ""
}: EnhancedServicesListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [billingType, setBillingType] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useApp();
  
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
        
        // Déterminer la plage de prix
        if (filteredServices.length > 0) {
          const prices = filteredServices.map(s => s.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
        
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
  
  const filterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };
  
  // Afficher un message si aucun service n'est disponible
  if (!isLoading && filteredServices.length === 0) {
    return (
      <motion.div 
        className={`p-6 text-center ${className}`}
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="text-gray-500 mb-4">
          {showSubscribedOnly
            ? "Vous n'êtes abonné à aucun service pour le moment."
            : "Aucun service ne correspond à vos critères de recherche."}
        </p>
        {activeFilters.length > 0 && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2">Filtres actifs:</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {filter}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </motion.div>
    );
  }
  
  return (
    <div className={className}>
      {/* Filtres */}
      <motion.div 
        className="mb-6"
        variants={filterVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            
            <Select value={billingType} onValueChange={setBillingType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Facturation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="recurring">Récurrent</SelectItem>
                <SelectItem value="onetime">Paiement unique</SelectItem>
              </SelectContent>
            </Select>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
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
                    <Label>Recherche</Label>
                    <Input
                      type="text"
                      placeholder="Rechercher un service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
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
                    <Label>Type de facturation</Label>
                    <Select value={billingType} onValueChange={setBillingType}>
                      <SelectTrigger>
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
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {filter}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
              Réinitialiser
            </Button>
          </div>
        )}
      </motion.div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit || 3)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredServices.map((service, index) => (
              <AnimatedServiceCard
                key={service.id}
                service={service}
                isSubscribed={isSubscribed(service.id)}
                onSubscribe={() => handleServiceClick(service)}
                onViewDetails={() => handleServiceClick(service)}
                showFeatures={false}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
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
