
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from "lucide-react";
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
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const { t, currency, formatAmount } = useApp();
  const { toast } = useToast();
  const { user } = useAuth();

  const resetForm = () => {
    setAmount("");
    setSelectedMethod("");
    setPaymentSuccess(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

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
        description: `${type === "deposit" ? "Dépôt de" : "Retrait de"} ${formatAmount(Number(amount))}`,
        variant: "default",
      });
      
      // Afficher l'écran de succès
      setPaymentSuccess(true);
      
      // Appeler le callback onSuccess si fourni
      if (onSuccess) {
        onSuccess(type, Number(amount));
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      toast({
        title: "Échec du paiement",
        description: "Une erreur s'est produite lors de la transaction",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method === selectedMethod ? "" : method);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!paymentSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">{t('depositWithdraw')}</DialogTitle>
              <DialogDescription className="text-center">
                Gérez votre solde Tontine facilement et en toute sécurité.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "creditcard" ? "bg-tontine-purple text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("creditcard")}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-center text-sm">Carte de crédit</span>
                      </Button>
                      <Button 
                        variant={selectedMethod === "mobilemoney" ? "default" : "outline"} 
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "mobilemoney" ? "bg-tontine-purple text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("mobilemoney")}
                      >
                        <Wallet className="h-6 w-6" />
                        <span className="text-center text-sm">Mobile Money</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-tontine-purple hover:bg-tontine-dark-purple" 
                    disabled={isProcessing || !amount || !selectedMethod}
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
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "bankaccount" ? "bg-tontine-purple text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("bankaccount")}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-center text-sm">Compte bancaire</span>
                      </Button>
                      <Button 
                        variant={selectedMethod === "mobilemoney" ? "default" : "outline"} 
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "mobilemoney" ? "bg-tontine-purple text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("mobilemoney")}
                      >
                        <Wallet className="h-6 w-6" />
                        <span className="text-center text-sm">Mobile Money</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-tontine-purple hover:bg-tontine-dark-purple" 
                    disabled={isProcessing || !amount || !selectedMethod}
                    onClick={() => handlePayment("withdraw")}
                  >
                    {isProcessing ? "Traitement en cours..." : "Retirer des fonds"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                {activeTab === "deposit" ? "Dépôt réussi!" : "Retrait réussi!"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "deposit" 
                  ? `Votre compte a été crédité de ${formatAmount(Number(amount))}.`
                  : `Votre demande de retrait de ${formatAmount(Number(amount))} a été traitée avec succès.`
                }
              </p>
            </div>
            
            <div className="flex flex-col w-full space-y-2">
              <Button
                onClick={() => {
                  setAmount("");
                  setSelectedMethod("");
                  setPaymentSuccess(false);
                }}
                variant="outline"
                className="w-full"
              >
                {activeTab === "deposit" ? "Effectuer un autre dépôt" : "Effectuer un autre retrait"}
              </Button>
              
              <Button
                onClick={handleClose}
                className="w-full bg-tontine-purple hover:bg-tontine-dark-purple"
              >
                Terminer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
