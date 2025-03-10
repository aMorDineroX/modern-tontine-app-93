
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<string>("deposit");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { t, currency } = useApp();
  const { toast } = useToast();

  const handlePayment = async (type: "deposit" | "withdraw") => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      toast({
        title: type === "deposit" ? "Deposit successful" : "Withdrawal successful",
        description: `${type === "deposit" ? "Deposited" : "Withdrawn"} ${currency.symbol}${amount}`,
        variant: "default",
      });
      
      // Reset form
      setAmount("");
      onClose();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "An error occurred during the transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">{t('depositWithdraw')}</DialogTitle>
          <DialogDescription className="text-center">
            Manage your Tontine balance easily and securely.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownToLine size={16} />
              <span>Deposit</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpFromLine size={16} />
              <span>Withdraw</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Deposit Amount</Label>
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
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex justify-center items-center gap-2 h-20">
                    <CreditCard className="h-6 w-6" />
                    <span>Credit Card</span>
                  </Button>
                  <Button variant="outline" className="flex justify-center items-center gap-2 h-20">
                    <Wallet className="h-6 w-6" />
                    <span>Mobile Money</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={isProcessing}
                onClick={() => handlePayment("deposit")}
              >
                {isProcessing ? "Processing..." : "Deposit Funds"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
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
                <Label>Withdrawal Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex justify-center items-center gap-2 h-20">
                    <CreditCard className="h-6 w-6" />
                    <span>Bank Account</span>
                  </Button>
                  <Button variant="outline" className="flex justify-center items-center gap-2 h-20">
                    <Wallet className="h-6 w-6" />
                    <span>Mobile Money</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={isProcessing}
                onClick={() => handlePayment("withdraw")}
              >
                {isProcessing ? "Processing..." : "Withdraw Funds"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
