import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, DollarSign, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodProps {
  onPaymentComplete: (reference: string) => void;
  amount: number;
  currency?: string;
  description?: string;
}

export default function EnhancedPaymentSystem({ 
  onPaymentComplete, 
  amount, 
  currency = "EUR", 
  description 
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Validation de base
      if (paymentMethod === "card") {
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
          throw new Error("Veuillez remplir tous les champs de la carte");
        }
        
        if (cardNumber.replace(/\s/g, '').length !== 16) {
          throw new Error("Le numéro de carte doit comporter 16 chiffres");
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          throw new Error("La date d'expiration doit être au format MM/AA");
        }
        
        if (!/^\d{3}$/.test(cardCvc)) {
          throw new Error("Le code CVC doit comporter 3 chiffres");
        }
      }
      
      // Simulation d'un paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer une référence de paiement
      const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      setIsPaymentComplete(true);
      
      toast({
        title: "Paiement réussi",
        description: `Votre paiement de ${amount} ${currency} a été traité avec succès.`,
      });
      
      // Attendre un peu avant d'appeler le callback
      setTimeout(() => {
        onPaymentComplete(paymentReference);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du traitement de votre paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Formater le numéro de carte avec des espaces tous les 4 chiffres
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formater la date d'expiration
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  if (isPaymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Paiement réussi</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Votre paiement de {amount} {currency} a été traité avec succès.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md w-full max-w-xs text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Référence de paiement</p>
              <p className="font-mono text-sm font-medium">PAY-{Date.now().toString().substring(0, 10)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Paiement</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="paypal">
              <Wallet className="h-4 w-4 mr-2" />
              PayPal
            </TabsTrigger>
            <TabsTrigger value="bank">
              <DollarSign className="h-4 w-4 mr-2" />
              Virement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Nom sur la carte</Label>
              <Input 
                id="cardName" 
                placeholder="John Doe" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Numéro de carte</Label>
              <Input 
                id="cardNumber" 
                placeholder="1234 5678 9012 3456" 
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Date d'expiration</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/AA" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  placeholder="123" 
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="paypal">
            <div className="text-center py-6">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-500 mb-4">
                Vous serez redirigé vers PayPal pour finaliser votre paiement.
              </p>
              <p className="text-xs text-gray-400">
                PayPal vous permet de payer en toute sécurité sans partager vos informations financières.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="bank">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <p className="text-sm font-medium">Coordonnées bancaires</p>
                <p className="text-xs text-gray-500 mt-1">IBAN: FR76 3000 4000 0300 0000 0000 000</p>
                <p className="text-xs text-gray-500">BIC: BNPAFRPP</p>
                <p className="text-xs text-gray-500">Référence: NAAT-{Date.now().toString().substring(0, 10)}</p>
              </div>
              <p className="text-sm text-gray-500">
                Veuillez effectuer un virement bancaire du montant indiqué et utiliser la référence ci-dessus.
              </p>
              <p className="text-xs text-gray-400">
                Le traitement des virements bancaires peut prendre 1 à 3 jours ouvrables.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-bold">
          {amount} {currency}
        </div>
        <Button onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <ChevronsUpDown className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            "Payer maintenant"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
