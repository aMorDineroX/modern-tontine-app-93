import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import PayPalButton from "./PayPalButton";
import { savePayPalTransaction } from "@/services/paypalService";

interface PayPalRecurringPaymentProps {
  groupId?: string;
  groupName?: string;
  defaultAmount?: number;
  onSuccess?: (details: any) => void;
}

export default function PayPalRecurringPayment({
  groupId,
  groupName = "Groupe Naat",
  defaultAmount = 0,
  onSuccess
}: PayPalRecurringPaymentProps) {
  const [amount, setAmount] = useState<string>(defaultAmount.toString());
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<"day" | "week" | "month" | "year">("month");
  const [cycles, setCycles] = useState<string>("0"); // 0 = until cancelled
  const { toast } = useToast();
  const { formatAmount, currency } = useApp();
  const { user } = useAuth();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accepter uniquement les nombres avec jusqu'à 2 décimales
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleCyclesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accepter uniquement les nombres entiers
    if (/^\d*$/.test(value) || value === "") {
      setCycles(value);
    }
  };

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
        transaction_id: details.paymentID || details.subscriptionID,
        order_id: details.orderID,
        subscription_id: details.subscriptionID,
        amount: parseFloat(amount),
        currency: currency,
        status: 'completed' as const,
        type: isRecurring ? 'subscription' as const : 'payment' as const,
        description: `Contribution pour ${groupName}${groupId ? ` (ID: ${groupId})` : ''}`,
        metadata: {
          group_id: groupId,
          group_name: groupName,
          frequency: isRecurring ? frequency : null,
          cycles: isRecurring ? parseInt(cycles) : null,
          details: details
        }
      };

      const { success, error } = await savePayPalTransaction(transaction);

      if (!success) {
        throw error;
      }

      toast({
        title: isRecurring ? "Abonnement activé" : "Paiement réussi",
        description: isRecurring
          ? `Votre abonnement de ${formatAmount(parseFloat(amount))} par ${getFrequencyLabel(frequency).toLowerCase()} a été activé`
          : `Votre paiement de ${formatAmount(parseFloat(amount))} a été effectué avec succès`,
      });

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

  const getFrequencyLabel = (freq: string): string => {
    switch (freq) {
      case "day": return "Jour";
      case "week": return "Semaine";
      case "month": return "Mois";
      case "year": return "Année";
      default: return "Mois";
    }
  };

  const isValidAmount = parseFloat(amount) > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contribution pour {groupName}</CardTitle>
        <CardDescription>
          Configurez votre paiement PayPal pour ce groupe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant</Label>
          <div className="flex items-center">
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="flex-1"
            />
            <span className="ml-2 text-sm font-medium">{currency}</span>
          </div>
          {!isValidAmount && amount !== "" && (
            <p className="text-sm text-red-500">Veuillez entrer un montant valide supérieur à 0</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="recurring" className="flex-1">Paiement récurrent</Label>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
        </div>

        {isRecurring && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as any)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Sélectionnez une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Quotidien</SelectItem>
                  <SelectItem value="week">Hebdomadaire</SelectItem>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycles">Nombre de cycles (0 = jusqu'à annulation)</Label>
              <Input
                id="cycles"
                type="text"
                value={cycles}
                onChange={handleCyclesChange}
                placeholder="0"
              />
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
              <p>
                Vous serez débité de <strong>{formatAmount(parseFloat(amount) || 0)}</strong> par{" "}
                <strong>{getFrequencyLabel(frequency).toLowerCase()}</strong>
                {cycles !== "0" ? ` pendant ${cycles} ${cycles === "1" ? "cycle" : "cycles"}` : " jusqu'à annulation"}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <PayPalButton
          amount={parseFloat(amount) || 0}
          currency={currency}
          description={`Contribution pour ${groupName}`}
          isRecurring={isRecurring}
          recurringFrequency={frequency}
          recurringCycles={parseInt(cycles) || 0}
          onSuccess={handlePaymentSuccess}
        />
      </CardFooter>
    </Card>
  );
}
