
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { processPayment } from "@/utils/supabase";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (type: "deposit" | "withdraw", amount: number) => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<string>("deposit");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const { t, currency } = useApp();
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayment = async (type: "deposit" | "withdraw") => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour effectuer cette opération",
        variant: "destructive",
      });
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Traiter le paiement avec Supabase
      const { success, error } = await processPayment(
        user.id,
        Number(amount),
        type
      );
      
      if (!success) {
        throw error || new Error("Une erreur est survenue lors du traitement");
      }
      
      // Afficher un message de réussite
      toast({
        title: type === "deposit" ? "Dépôt réussi" : "Retrait réussi",
        description: `${type === "deposit" ? "Dépôt de" : "Retrait de"} ${currency.symbol}${amount}`,
        variant: "default",
      });
      
      // Réinitialiser le formulaire
      setAmount("");
      setSelectedMethod("");
      
      // Appeler le callback onSuccess si fourni
      if (onSuccess) {
        onSuccess(type, Number(amount));
      }
      
      // Fermer la modale
      onClose();
    } catch (error) {
      console.error("Erreur de paiement:", error);
      toast({
        title: "Échec du paiement",
        description: "Une erreur s'est produite lors de la transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method === selectedMethod ? "" : method);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">{t('depositWithdraw')}</DialogTitle>
          <DialogDescription className="text-center">
            Gérez votre solde Tontine facilement et en toute sécurité.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownToLine size={16} />
              <span>Dépôt</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpFromLine size={16} />
              <span>Retrait</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Montant du dépôt</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency.symbol}
                  </span>
                  <Input
                    id="deposit-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedMethod === "creditcard" ? "default" : "outline"} 
                    className={`flex justify-center items-center gap-2 h-20 ${
                      selectedMethod === "creditcard" ? "bg-tontine-purple text-white" : ""
                    }`}
                    onClick={() => handleMethodSelect("creditcard")}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Carte de crédit</span>
                  </Button>
                  <Button 
                    variant={selectedMethod === "mobilemoney" ? "default" : "outline"} 
                    className={`flex justify-center items-center gap-2 h-20 ${
                      selectedMethod === "mobilemoney" ? "bg-tontine-purple text-white" : ""
                    }`}
                    onClick={() => handleMethodSelect("mobilemoney")}
                  >
                    <Wallet className="h-6 w-6" />
                    <span>Mobile Money</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-tontine-purple hover:bg-tontine-dark-purple" 
                disabled={isProcessing}
                onClick={() => handlePayment("deposit")}
              >
                {isProcessing ? "Traitement en cours..." : "Déposer des fonds"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Montant du retrait</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency.symbol}
                  </span>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Méthode de retrait</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedMethod === "bankaccount" ? "default" : "outline"} 
                    className={`flex justify-center items-center gap-2 h-20 ${
                      selectedMethod === "bankaccount" ? "bg-tontine-purple text-white" : ""
                    }`}
                    onClick={() => handleMethodSelect("bankaccount")}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Compte bancaire</span>
                  </Button>
                  <Button 
                    variant={selectedMethod === "mobilemoney" ? "default" : "outline"} 
                    className={`flex justify-center items-center gap-2 h-20 ${
                      selectedMethod === "mobilemoney" ? "bg-tontine-purple text-white" : ""
                    }`}
                    onClick={() => handleMethodSelect("mobilemoney")}
                  >
                    <Wallet className="h-6 w-6" />
                    <span>Mobile Money</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-tontine-purple hover:bg-tontine-dark-purple" 
                disabled={isProcessing}
                onClick={() => handlePayment("withdraw")}
              >
                {isProcessing ? "Traitement en cours..." : "Retirer des fonds"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
