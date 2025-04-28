import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getLoyaltyAccount, 
  getLoyaltyTransactions, 
  getAvailableLoyaltyRewards,
  getUserLoyaltyRewardClaims,
  claimLoyaltyReward,
  getLoyaltyTierText,
  getTransactionTypeText,
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyRewardClaim
} from '@/services/loyaltyService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Gift, 
  History, 
  ChevronRight, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  Percent,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoyaltyProgramProps {
  className?: string;
}

/**
 * Composant pour afficher le programme de fidélité
 * 
 * @component
 * @param {LoyaltyProgramProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant LoyaltyProgram
 */
const LoyaltyProgram: React.FC<LoyaltyProgramProps> = ({
  className = ""
}) => {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [claims, setClaims] = useState<LoyaltyRewardClaim[]>([]);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('account');
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Charger les données du programme de fidélité
  useEffect(() => {
    const loadLoyaltyData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Charger le compte de fidélité
        const { success: accountSuccess, data: accountData, error: accountError } = await getLoyaltyAccount(user.id);
        
        if (!accountSuccess) {
          throw accountError;
        }
        
        setAccount(accountData);
        
        // Charger les transactions
        const { success: transactionsSuccess, data: transactionsData, error: transactionsError } = await getLoyaltyTransactions(user.id);
        
        if (!transactionsSuccess) {
          throw transactionsError;
        }
        
        setTransactions(transactionsData || []);
        
        // Charger les récompenses disponibles
        const { success: rewardsSuccess, data: rewardsData, error: rewardsError } = await getAvailableLoyaltyRewards(user.id);
        
        if (!rewardsSuccess) {
          throw rewardsError;
        }
        
        setRewards(rewardsData || []);
        
        // Charger les récompenses réclamées
        const { success: claimsSuccess, data: claimsData, error: claimsError } = await getUserLoyaltyRewardClaims(user.id);
        
        if (!claimsSuccess) {
          throw claimsError;
        }
        
        setClaims(claimsData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données de fidélité:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du programme de fidélité",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLoyaltyData();
  }, [user, toast]);
  
  // Gérer la réclamation d'une récompense
  const handleClaimReward = async () => {
    if (!user || !selectedReward) return;
    
    try {
      const { success, data, error } = await claimLoyaltyReward(user.id, selectedReward.id);
      
      if (!success) {
        throw error;
      }
      
      // Recharger les données
      const { success: accountSuccess, data: accountData } = await getLoyaltyAccount(user.id);
      const { success: rewardsSuccess, data: rewardsData } = await getAvailableLoyaltyRewards(user.id);
      const { success: claimsSuccess, data: claimsData } = await getUserLoyaltyRewardClaims(user.id);
      
      if (accountSuccess) setAccount(accountData);
      if (rewardsSuccess) setRewards(rewardsData || []);
      if (claimsSuccess) setClaims(claimsData || []);
      
      toast({
        title: "Récompense réclamée",
        description: `Vous avez réclamé la récompense "${selectedReward.name}"`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la réclamation de la récompense:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réclamer la récompense",
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedReward(null);
    }
  };
  
  // Obtenir l'icône du type de récompense
  const getRewardTypeIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'discount':
        return <Percent className="h-4 w-4" />;
      case 'free_month':
        return <Calendar className="h-4 w-4" />;
      case 'cash':
        return <CreditCard className="h-4 w-4" />;
      case 'service':
        return <Gift className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };
  
  // Obtenir le texte du type de récompense
  const getRewardTypeText = (rewardType: string, rewardValue: any) => {
    switch (rewardType) {
      case 'discount':
        return `Remise de ${rewardValue.percentage}%`;
      case 'free_month':
        return `${rewardValue.months} mois gratuit`;
      case 'cash':
        return `${rewardValue.amount} ${rewardValue.currency}`;
      case 'service':
        return `Service gratuit`;
      default:
        return 'Récompense';
    }
  };
  
  // Obtenir la couleur du niveau de fidélité
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-600';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }
  
  if (!account) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Programme de fidélité</h2>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder au programme de fidélité.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculer le pourcentage de progression vers le niveau suivant
  const progressPercentage = account.next_tier === account.tier
    ? 100
    : Math.round(((account.points - 0) / (account.points + account.points_to_next_tier)) * 100);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Programme de fidélité</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Mon compte</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>Récompenses</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Mon niveau de fidélité</CardTitle>
                    <Badge className={`${getTierColor(account.tier)} text-white`}>
                      {getLoyaltyTierText(account.tier)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Gagnez des points en vous abonnant à des services et en parrainant des amis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Points actuels</span>
                    <span className="text-lg font-bold">{account.points}</span>
                  </div>
                  
                  {account.next_tier !== account.tier && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>{getLoyaltyTierText(account.tier)}</span>
                        <span>{getLoyaltyTierText(account.next_tier)}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {account.points_to_next_tier} points supplémentaires pour atteindre le niveau {getLoyaltyTierText(account.next_tier)}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Avantages du niveau {getLoyaltyTierText(account.tier)}</h4>
                    <ul className="space-y-1 text-sm">
                      {account.tier === 'bronze' && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Accès aux récompenses de base</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>5 points par euro dépensé</span>
                          </li>
                        </>
                      )}
                      {account.tier === 'silver' && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Tous les avantages Bronze</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>7 points par euro dépensé</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Accès aux récompenses de niveau Argent</span>
                          </li>
                        </>
                      )}
                      {account.tier === 'gold' && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Tous les avantages Argent</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>10 points par euro dépensé</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Accès aux récompenses de niveau Or</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Support prioritaire</span>
                          </li>
                        </>
                      )}
                      {account.tier === 'platinum' && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Tous les avantages Or</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>15 points par euro dépensé</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Accès aux récompenses exclusives Platine</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Support VIP 24/7</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Invitations à des événements exclusifs</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('rewards')}
                  >
                    <span>Voir les récompenses disponibles</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="rewards">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Récompenses disponibles</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {account.points} points
                </Badge>
              </div>
              
              {rewards.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune récompense disponible pour le moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward) => (
                    <Card 
                      key={reward.id}
                      className={`overflow-hidden ${!reward.is_available ? 'opacity-60' : ''}`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{reward.name}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${
                              reward.min_tier === 'bronze' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              reward.min_tier === 'silver' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                              reward.min_tier === 'gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <Award className="h-3 w-3" />
                            {getLoyaltyTierText(reward.min_tier)}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {reward.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-2 mb-2">
                          {getRewardTypeIcon(reward.reward_type)}
                          <span className="text-sm font-medium">
                            {getRewardTypeText(reward.reward_type, reward.reward_value)}
                          </span>
                        </div>
                        
                        {!reward.is_available && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <X className="h-4 w-4" />
                            <span>{reward.reason_if_unavailable}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <span className="font-bold">{reward.points_cost} points</span>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={!reward.is_available}
                          onClick={() => {
                            setSelectedReward(reward);
                            setIsConfirmDialogOpen(true);
                          }}
                        >
                          Obtenir
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Mes récompenses</h3>
                
                {claims.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Vous n'avez pas encore réclamé de récompense.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <Card key={claim.claim_id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{claim.reward_name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`${
                                claim.status === 'claimed' ? 'bg-green-50 text-green-700 border-green-200' :
                                claim.status === 'used' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                claim.status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {claim.status === 'claimed' ? 'Réclamée' :
                               claim.status === 'used' ? 'Utilisée' :
                               claim.status === 'expired' ? 'Expirée' :
                               'Annulée'}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {claim.reward_description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getRewardTypeIcon(claim.reward_type)}
                            <span className="text-sm font-medium">
                              {getRewardTypeText(claim.reward_type, claim.reward_value)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Réclamée le {format(new Date(claim.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          
                          {claim.expires_at && claim.status === 'claimed' && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Expire le {format(new Date(claim.expires_at), 'dd MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <span className="text-sm text-muted-foreground">
                            {claim.points_spent} points dépensés
                          </span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="history">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Historique des transactions</CardTitle>
                  <CardDescription>
                    Historique de vos gains et dépenses de points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucune transaction pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex justify-between items-center p-3 border-b last:border-0"
                        >
                          <div>
                            <div className="font-medium">
                              {getTransactionTypeText(transaction.transaction_type)}
                            </div>
                            {transaction.description && (
                              <div className="text-sm text-muted-foreground">
                                {transaction.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(transaction.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                            </div>
                          </div>
                          <div className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points} points
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réclamation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réclamer cette récompense ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{selectedReward.name}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {selectedReward.points_cost} points
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedReward.description}
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {getRewardTypeIcon(selectedReward.reward_type)}
                <span>
                  {getRewardTypeText(selectedReward.reward_type, selectedReward.reward_value)}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="default"
              onClick={handleClaimReward}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyProgram;
