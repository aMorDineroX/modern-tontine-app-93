import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createPaymentIntent, confirmPaymentIntent } from "@/services/stripeService";

interface CreditCardPaymentProps {
  amount: number;
  description: string;
  onSuccess: (details: any) => void;
  onCancel?: () => void;
  buttonText?: string;
  className?: string;
}

/**
 * Composant pour le paiement par carte de crédit
 * 
 * @component
 * @param {CreditCardPaymentProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant CreditCardPayment
 */
export default function CreditCardPayment({
  amount,
  description,
  onSuccess,
  onCancel,
  buttonText = "Payer par carte",
  className = ""
}: CreditCardPaymentProps) {
  // États pour le formulaire
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  
  // États pour le processus de paiement
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  
  const { formatAmount } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Formater le numéro de carte
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
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };
  
  // Gérer le changement du numéro de carte
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };
  
  // Gérer le changement de la date d'expiration
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardExpiry(formatExpiry(value));
  };
  
  // Gérer le paiement
  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un paiement",
        variant: "destructive",
      });
      return;
    }
    
    // Valider les champs
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim() || !cardName.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    
    // Valider le format du numéro de carte
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError("Numéro de carte invalide");
      return;
    }
    
    // Valider le format de la date d'expiration
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(cardExpiry)) {
      setError("Date d'expiration invalide (MM/AA)");
      return;
    }
    
    // Valider le format du CVC
    if (cardCvc.length < 3) {
      setError("CVC invalide");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Créer une intention de paiement
      const { success: intentSuccess, data: intentData, error: intentError } = await createPaymentIntent(
        amount,
        'eur',
        description,
        { userId: user.id }
      );
      
      if (!intentSuccess || !intentData) {
        throw intentError || new Error("Erreur lors de la création de l'intention de paiement");
      }
      
      // Simuler la confirmation du paiement (dans une vraie implémentation, cela utiliserait Stripe.js)
      // Pour les besoins de cette démonstration, nous simulons un paiement réussi
      
      // Dans une implémentation réelle, vous utiliseriez Stripe.js pour créer un token de carte
      // const { token } = await stripe.createToken({
      //   number: cardNumber.replace(/\s+/g, ''),
      //   exp_month: parseInt(cardExpiry.split('/')[0]),
      //   exp_year: parseInt(`20${cardExpiry.split('/')[1]}`),
      //   cvc: cardCvc,
      //   name: cardName
      // });
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une confirmation réussie
      const paymentDetails = {
        id: `sim_${Date.now()}`,
        amount: amount,
        currency: 'eur',
        status: 'succeeded',
        payment_method: 'card',
        card: {
          brand: 'visa',
          last4: cardNumber.slice(-4),
          exp_month: parseInt(cardExpiry.split('/')[0]),
          exp_year: parseInt(`20${cardExpiry.split('/')[1]}`),
        }
      };
      
      setPaymentSuccess(true);
      
      // Notifier le parent du succès
      onSuccess(paymentDetails);
      
      toast({
        title: "Paiement réussi",
        description: `Votre paiement de ${formatAmount(amount)} a été traité avec succès`,
      });
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      setError("Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };
  
  // Afficher le message de succès
  if (paymentSuccess) {
    return (
      <motion.div 
        className={`text-center p-6 ${className}`}
        variants={successVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold">Paiement réussi</h3>
          <p className="text-gray-500">
            Votre paiement de {formatAmount(amount)} a été traité avec succès.
          </p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Paiement par carte</CardTitle>
          <CardDescription>Saisissez les informations de votre carte de crédit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Numéro de carte</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="card-number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="pl-9"
                maxLength={19}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Date d'expiration</Label>
              <Input
                id="card-expiry"
                type="text"
                placeholder="MM/AA"
                value={cardExpiry}
                onChange={handleExpiryChange}
                maxLength={5}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                type="text"
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                maxLength={3}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-name">Nom sur la carte</Label>
            <Input
              id="card-name"
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Montant</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{description}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annuler
            </Button>
          )}
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={onCancel ? "" : "w-full"}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Traitement en cours...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
