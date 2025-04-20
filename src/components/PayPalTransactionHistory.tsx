import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCcw, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPayPalTransactions, PayPalTransaction, savePayPalRefund } from "@/services/paypalService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PayPalTransactionHistoryProps {
  limit?: number;
  showRefundOption?: boolean;
  onRefund?: (transaction: PayPalTransaction) => void;
}

export default function PayPalTransactionHistory({
  limit,
  showRefundOption = false,
  onRefund
}: PayPalTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PayPalTransaction | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState<boolean>(false);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("");
  const [isProcessingRefund, setIsProcessingRefund] = useState<boolean>(false);
  const { toast } = useToast();
  const { formatAmount, formatDate } = useApp();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { success, data, error } = await getUserPayPalTransactions(user.id);
      
      if (!success) {
        throw error;
      }
      
      setTransactions(limit ? data.slice(0, limit) : data);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'historique des transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleRefundClick = (transaction: PayPalTransaction) => {
    if (transaction.status === 'refunded') {
      toast({
        title: "Impossible de rembourser",
        description: "Cette transaction a déjà été remboursée",
        variant: "destructive",
      });
      return;
    }

    if (transaction.type === 'refund') {
      toast({
        title: "Impossible de rembourser",
        description: "Vous ne pouvez pas rembourser un remboursement",
        variant: "destructive",
      });
      return;
    }

    setSelectedTransaction(transaction);
    setRefundAmount(transaction.amount.toString());
    setRefundReason("");
    setIsRefundDialogOpen(true);
  };

  const processRefund = async () => {
    if (!selectedTransaction || !user) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedTransaction.amount) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide inférieur ou égal au montant original",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingRefund(true);
    try {
      // Dans une application réelle, vous feriez un appel à l'API PayPal ici
      // pour effectuer le remboursement côté PayPal
      const refundId = `refund_${Date.now()}`;
      
      const { success, error } = await savePayPalRefund(
        user.id,
        selectedTransaction.transaction_id,
        refundId,
        amount,
        selectedTransaction.currency,
        refundReason || "Remboursement demandé par l'utilisateur"
      );
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Remboursement effectué",
        description: `Le remboursement de ${formatAmount(amount)} a été effectué avec succès`,
      });
      
      setIsRefundDialogOpen(false);
      fetchTransactions();
      
      if (onRefund) {
        onRefund(selectedTransaction);
      }
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
      toast({
        title: "Erreur de remboursement",
        description: "Une erreur est survenue lors du remboursement",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getStatusBadge = (status: PayPalTransaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Échoué</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-500">Remboursé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: PayPalTransaction['type']) => {
    switch (type) {
      case 'payment':
        return <ArrowUpFromLine className="h-4 w-4 text-green-500" />;
      case 'subscription':
        return <RefreshCcw className="h-4 w-4 text-purple-500" />;
      case 'refund':
        return <ArrowDownToLine className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: PayPalTransaction['type']) => {
    switch (type) {
      case 'payment':
        return "Paiement";
      case 'subscription':
        return "Abonnement";
      case 'refund':
        return "Remboursement";
      default:
        return type;
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions PayPal</CardTitle>
            <CardDescription>
              Historique de vos transactions PayPal
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="sr-only">Actualiser</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune transaction PayPal trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    {showRefundOption && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(new Date(transaction.created_at))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(transaction.type)}
                          <span>{getTypeLabel(transaction.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={transaction.type === 'refund' ? 'text-blue-500' : 'text-green-500'}>
                          {transaction.type === 'refund' ? '-' : ''}{formatAmount(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      {showRefundOption && (
                        <TableCell>
                          {transaction.type === 'payment' && transaction.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRefundClick(transaction)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Rembourser
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser la transaction</DialogTitle>
            <DialogDescription>
              Veuillez spécifier le montant et la raison du remboursement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Montant à rembourser</Label>
              <div className="flex items-center">
                <Input
                  id="refund-amount"
                  type="text"
                  value={refundAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
                      setRefundAmount(value);
                    }
                  }}
                  placeholder="0.00"
                  className="flex-1"
                />
                <span className="ml-2 text-sm font-medium">
                  {selectedTransaction?.currency || "EUR"}
                </span>
              </div>
              {selectedTransaction && parseFloat(refundAmount) > selectedTransaction.amount && (
                <p className="text-sm text-red-500">
                  Le montant ne peut pas dépasser le montant original de {formatAmount(selectedTransaction.amount)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Raison du remboursement</Label>
              <Input
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Raison du remboursement"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
              disabled={isProcessingRefund}
            >
              Annuler
            </Button>
            <Button
              onClick={processRefund}
              disabled={
                isProcessingRefund ||
                !refundAmount ||
                parseFloat(refundAmount) <= 0 ||
                (selectedTransaction && parseFloat(refundAmount) > selectedTransaction.amount)
              }
            >
              {isProcessingRefund ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Rembourser"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
