import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PayPalTransactionHistory from "@/components/PayPalTransactionHistory";
import PayPalRecurringPayment from "@/components/PayPalRecurringPayment";
import { cancelPayPalSubscription } from "@/services/paypalService";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PayPalTransactions() {
  const [activeTab, setActiveTab] = useState<string>("history");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!user) return;

    try {
      const { success, error } = await cancelPayPalSubscription(subscriptionId);
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement PayPal a été annulé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'abonnement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de l'abonnement",
        variant: "destructive",
      });
    }
  };

  const handleTransactionSuccess = () => {
    toast({
      title: "Transaction réussie",
      description: "Votre transaction PayPal a été effectuée avec succès",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Transactions PayPal | Naat</title>
      </Helmet>

      <div className="mb-6">
        <Link to="/transactions" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux transactions
        </Link>
        
        <h1 className="text-3xl font-bold">Transactions PayPal</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez vos transactions et abonnements PayPal
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="history" className="flex-1">Historique</TabsTrigger>
          <TabsTrigger value="recurring" className="flex-1">Paiements récurrents</TabsTrigger>
          <TabsTrigger value="refunds" className="flex-1">Remboursements</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <PayPalTransactionHistory />
        </TabsContent>

        <TabsContent value="recurring">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurer un paiement récurrent</CardTitle>
                <CardDescription>
                  Créez un abonnement PayPal pour automatiser vos contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PayPalRecurringPayment
                  defaultAmount={25}
                  onSuccess={handleTransactionSuccess}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abonnements actifs</CardTitle>
                <CardDescription>
                  Gérez vos abonnements PayPal existants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PayPalTransactionHistory
                  limit={5}
                  showRefundOption={false}
                />
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Gestion des abonnements",
                        description: "Pour gérer tous vos abonnements, veuillez vous connecter à votre compte PayPal",
                      });
                      window.open("https://www.paypal.com/myaccount/autopay", "_blank");
                    }}
                  >
                    Gérer tous mes abonnements PayPal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de remboursement</CardTitle>
              <CardDescription>
                Consultez et gérez vos remboursements PayPal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayPalTransactionHistory
                showRefundOption={true}
                onRefund={(transaction) => {
                  toast({
                    title: "Remboursement initié",
                    description: `Le remboursement de la transaction ${transaction.transaction_id.substring(0, 8)}... a été initié`,
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
