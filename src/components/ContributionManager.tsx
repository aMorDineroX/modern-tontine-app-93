
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Clock, AlertTriangle, X, Plus, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Contribution, 
  createContribution, 
  updateContributionStatus, 
  fetchGroupContributions 
} from "@/utils/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContributionManagerProps {
  groupId: string | number;
  groupName: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
}

export default function ContributionManager({ 
  groupId, 
  groupName, 
  contributionAmount, 
  frequency 
}: ContributionManagerProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { t, formatAmount, currency } = useApp();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fonction pour charger les contributions
  const loadContributions = async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await fetchGroupContributions(groupId);
      
      if (error) throw error;
      
      if (data) {
        setContributions(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des contributions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contributions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les contributions au chargement du composant
  useEffect(() => {
    loadContributions();
  }, [groupId]);

  // Filtrer les contributions selon l'onglet actif
  const filteredContributions = contributions.filter(contribution => {
    const today = new Date();
    const paymentDate = new Date(contribution.payment_date);
    
    switch (activeTab) {
      case "upcoming":
        return paymentDate >= today && contribution.status === "pending";
      case "paid":
        return contribution.status === "paid";
      case "missed":
        return contribution.status === "missed" || (paymentDate < today && contribution.status === "pending");
      default:
        return true;
    }
  });

  // Gérer le changement de statut d'une contribution
  const handleStatusChange = async (contributionId: string | number, newStatus: 'pending' | 'paid' | 'missed') => {
    try {
      const { data, error } = await updateContributionStatus(contributionId, newStatus);
      
      if (error) throw error;
      
      if (data) {
        // Mettre à jour la liste locale des contributions
        setContributions(prevContributions => 
          prevContributions.map(contribution => 
            contribution.id === contributionId 
              ? { ...contribution, status: newStatus } 
              : contribution
          )
        );
        
        toast({
          title: "Statut mis à jour",
          description: `La contribution a été marquée comme ${newStatus === 'paid' ? 'payée' : newStatus === 'missed' ? 'manquée' : 'en attente'}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la contribution",
        variant: "destructive",
      });
    }
  };

  // Créer une nouvelle contribution
  const handleCreateContribution = async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour créer une contribution",
        variant: "destructive",
      });
      return;
    }
    
    if (!paymentDate) {
      toast({
        title: "Date requise",
        description: "Veuillez sélectionner une date de paiement",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const contributionData = {
        group_id: groupId,
        user_id: user.id,
        amount: contributionAmount,
        payment_date: new Date(paymentDate).toISOString(),
        status: 'pending' as const
      };
      
      const { data, error } = await createContribution(contributionData);
      
      if (error) throw error;
      
      if (data) {
        // Ajouter la nouvelle contribution à la liste locale
        setContributions(prevContributions => [data, ...prevContributions]);
        
        toast({
          title: "Contribution créée",
          description: "La contribution a été créée avec succès",
          variant: "default",
        });
        
        // Fermer la modale et réinitialiser le formulaire
        setIsCreateModalOpen(false);
        setPaymentDate("");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la contribution:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la contribution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtenir la classe et l'icône pour un statut
  const getStatusInfo = (status: string, paymentDate: string) => {
    const isPastDue = new Date(paymentDate) < new Date() && status === 'pending';
    
    if (isPastDue) {
      return {
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        iconComponent: <AlertTriangle className="h-4 w-4" />,
        label: "En retard"
      };
    }
    
    switch (status) {
      case 'paid':
        return {
          badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          iconComponent: <Check className="h-4 w-4" />,
          label: "Payée"
        };
      case 'missed':
        return {
          badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          iconComponent: <X className="h-4 w-4" />,
          label: "Manquée"
        };
      default:
        return {
          badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          iconComponent: <Clock className="h-4 w-4" />,
          label: "En attente"
        };
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('contributions')}</CardTitle>
              <CardDescription>{groupName}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>{t('addContribution')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
              <TabsTrigger value="paid">{t('paid')}</TabsTrigger>
              <TabsTrigger value="missed">{t('missed')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tontine-purple"></div>
                </div>
              ) : filteredContributions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === "upcoming" 
                      ? "Aucune contribution à venir" 
                      : activeTab === "paid" 
                        ? "Aucune contribution payée" 
                        : "Aucune contribution manquée"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContributions.map((contribution) => {
                    const statusInfo = getStatusInfo(contribution.status, contribution.payment_date);
                    const isPastDue = new Date(contribution.payment_date) < new Date() && contribution.status === 'pending';
                    
                    return (
                      <div 
                        key={contribution.id} 
                        className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {formatDate(contribution.payment_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusInfo.badgeClass}>
                                <span className="flex items-center gap-1">
                                  {statusInfo.iconComponent}
                                  {statusInfo.label}
                                </span>
                              </Badge>
                              <span className="text-sm font-semibold text-tontine-purple dark:text-tontine-light-purple">
                                {formatAmount(contribution.amount)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {contribution.status !== 'paid' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                                onClick={() => handleStatusChange(contribution.id, 'paid')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marquer payée
                              </Button>
                            )}
                            
                            {(contribution.status === 'pending' && isPastDue) && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                                onClick={() => handleStatusChange(contribution.id, 'missed')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Marquer manquée
                              </Button>
                            )}
                            
                            {contribution.status !== 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900/20"
                                onClick={() => handleStatusChange(contribution.id, 'pending')}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                En attente
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('contributionAmount')}: <span className="font-semibold">{formatAmount(contributionAmount)}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('frequency')}: <span className="font-semibold">{t(frequency)}</span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Modale de création de contribution */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une contribution</DialogTitle>
            <DialogDescription>
              Planifiez une nouvelle contribution pour le groupe {groupName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-date">Date de paiement</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {currency.symbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={contributionAmount}
                  disabled
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500">
                Le montant est fixé selon les paramètres du groupe.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateContribution} 
              disabled={isSubmitting}
              className="bg-tontine-purple hover:bg-tontine-dark-purple"
            >
              {isSubmitting ? "Création..." : "Créer la contribution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
