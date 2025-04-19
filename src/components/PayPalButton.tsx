
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PayPalButtonProps {
  amount: number;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handlePayPalClick = async () => {
    setIsLoading(true);
    try {
      // Simulation d'un paiement PayPal pour la démo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Paiement réussi",
        description: `Votre paiement de ${amount}€ a été effectué avec succès via PayPal`,
      });
      
      if (onSuccess) {
        onSuccess({ status: "COMPLETED", amount: amount });
      }
    } catch (error) {
      console.error("Erreur PayPal:", error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du paiement PayPal",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handlePayPalClick}
      disabled={isLoading}
      className="w-full bg-[#0070BA] hover:bg-[#003087] text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : (
        <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png" 
             alt="PayPal" 
             className="h-4" 
        />
      )}
      {isLoading ? "Traitement en cours..." : "Payer avec PayPal"}
    </button>
  );
}
