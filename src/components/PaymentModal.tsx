import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, RefreshCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { processPayment } from "@/utils/supabase";
import PayPalButton from "./PayPalButton";
import { savePayPalTransaction } from "@/services/paypalService";
import PayPalRecurringPayment from "./PayPalRecurringPayment";

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
      const { success, error } = await processPayment(
        user.id,
        Number(amount),
        type
      );

      if (!success) {
        throw error || new Error("Une erreur est survenue lors du traitement");
      }

      toast({
        title: type === "deposit" ? "Dépôt réussi" : "Retrait réussi",
        description: `${type === "deposit" ? "Dépôt de" : "Retrait de"} ${formatAmount(Number(amount))}`,
        variant: "default",
      });

      setPaymentSuccess(true);

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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit" className="flex items-center gap-2">
                  <ArrowDownToLine size={16} />
                  <span>Dépôt</span>
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex items-center gap-2">
                  <ArrowUpFromLine size={16} />
                  <span>Retrait</span>
                </TabsTrigger>
                <TabsTrigger value="recurring" className="flex items-center gap-2">
                  <RefreshCcw size={16} />
                  <span>Récurrent</span>
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
                          selectedMethod === "creditcard" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("creditcard")}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-center text-sm">Carte bancaire</span>
                      </Button>
                      <Button
                        variant={selectedMethod === "paypal" ? "default" : "outline"}
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "paypal" ? "bg-[#0070BA] text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("paypal")}
                      >
                        <img
                          src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png"
                          alt="PayPal"
                          className="h-6"
                        />
                        <span className="text-center text-sm">PayPal</span>
                      </Button>
                    </div>
                  </div>

                  {selectedMethod === "paypal" ? (
                    <PayPalButton
                      amount={Number(amount)}
                      currency={currency}
                      description="Dépôt sur votre compte Naat"
                      onSuccess={async (details) => {
                        if (user) {
                          try {
                            // Enregistrer la transaction PayPal
                            const transaction = {
                              user_id: user.id,
                              transaction_id: details.paymentID,
                              order_id: details.orderID,
                              amount: Number(amount),
                              currency: currency,
                              status: 'completed' as const,
                              type: 'payment' as const,
                              description: "Dépôt sur votre compte Naat",
                              metadata: { details }
                            };

                            await savePayPalTransaction(transaction);
                          } catch (error) {
                            console.error("Erreur lors de l'enregistrement de la transaction PayPal:", error);
                          }
                        }

                        setPaymentSuccess(true);
                        if (onSuccess) {
                          onSuccess("deposit", Number(amount));
                        }
                      }}
                    />
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isProcessing || !amount || !selectedMethod}
                      onClick={() => handlePayment("deposit")}
                    >
                      {isProcessing ? "Traitement en cours..." : "Payer par carte"}
                    </Button>
                  )}
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
                          selectedMethod === "bankaccount" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("bankaccount")}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-center text-sm">Compte bancaire</span>
                      </Button>
                      <Button
                        variant={selectedMethod === "mobilemoney" ? "default" : "outline"}
                        className={`flex flex-col justify-center items-center gap-2 h-24 p-2 ${
                          selectedMethod === "mobilemoney" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleMethodSelect("mobilemoney")}
                      >
                        <Wallet className="h-6 w-6" />
                        <span className="text-center text-sm">Mobile Money</span>
                      </Button>
                    </div>
                  </div>

                  {selectedMethod === "paypal" ? (
                    <Button
                      className="w-full bg-[#0070BA] hover:bg-[#003087] text-white"
                      disabled={isProcessing || !amount}
                      onClick={() => {
                        toast({
                          title: "PayPal",
                          description: "Les retraits via PayPal seront traités dans un délai de 24 à 48 heures.",
                        });
                        setPaymentSuccess(true);
                        if (onSuccess) {
                          onSuccess("withdraw", Number(amount));
                        }
                      }}
                    >
                      <img
                        src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png"
                        alt="PayPal"
                        className="h-4 mr-2"
                      />
                      Retirer vers PayPal
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isProcessing || !amount || !selectedMethod}
                      onClick={() => handlePayment("withdraw")}
                    >
                      {isProcessing ? "Traitement en cours..." : "Retirer des fonds"}
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recurring" className="py-4">
                <PayPalRecurringPayment
                  defaultAmount={10}
                  onSuccess={(details) => {
                    setPaymentSuccess(true);
                    if (onSuccess) {
                      onSuccess("deposit", details.amount);
                    }
                  }}
                />
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
                className="w-full bg-primary hover:bg-primary/90"
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
