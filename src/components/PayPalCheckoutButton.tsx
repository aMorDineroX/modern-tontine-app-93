import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { savePayPalTransaction } from "@/services/paypalService";
import PayPalButton from "./PayPalButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PayPalCheckoutButtonProps {
  amount: number;
  description: string;
  groupId?: string;
  groupName?: string;
  onSuccess?: (details: any) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export default function PayPalCheckoutButton({
  amount,
  description,
  groupId,
  groupName,
  onSuccess,
  buttonText = "Payer avec PayPal",
  buttonVariant = "default"
}: PayPalCheckoutButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { formatAmount, currency } = useApp();
  const { user } = useAuth();

  const handlePaymentSuccess = async (details: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return;
    }

    try {
      // Enregistrer la transaction dans la base de données
      const transaction = {
        user_id: user.id,
        transaction_id: details.paymentID,
        order_id: details.orderID,
        amount: amount,
        currency: currency,
        status: 'completed' as const,
        type: 'payment' as const,
        description: description,
        metadata: {
          group_id: groupId,
          group_name: groupName,
          details: details
        }
      };

      const { success, error } = await savePayPalTransaction(transaction);

      if (!success) {
        throw error;
      }

      toast({
        title: "Paiement réussi",
        description: `Votre paiement de ${formatAmount(amount)} a été effectué avec succès`,
      });

      setIsDialogOpen(false);

      if (onSuccess) {
        onSuccess(details);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la transaction:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant as any}
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <img
          src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png"
          alt="PayPal"
          className="h-4"
        />
        {buttonText}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paiement PayPal</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold">{formatAmount(amount)}</p>
            </div>
            
            <PayPalButton
              amount={amount}
              currency={currency}
              description={description}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
