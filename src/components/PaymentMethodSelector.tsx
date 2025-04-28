import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayPalCheckoutButton } from "./PayPalCheckoutButton";
import CreditCardPayment from "./CreditCardPayment";
import BankTransferDetails from "./BankTransferDetails";
import { CreditCard, Banknote, Wallet } from "lucide-react";

interface PaymentMethodSelectorProps {
  amount: number;
  description: string;
  onSuccess: (details: any) => void;
  className?: string;
}

/**
 * Composant pour sélectionner la méthode de paiement
 * 
 * @component
 * @param {PaymentMethodSelectorProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant PaymentMethodSelector
 */
export default function PaymentMethodSelector({
  amount,
  description,
  onSuccess,
  className = ""
}: PaymentMethodSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("card");
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: 10,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Carte
          </TabsTrigger>
          <TabsTrigger value="paypal" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            PayPal
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Virement
          </TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TabsContent value="card" className="mt-0">
              <CreditCardPayment
                amount={amount}
                description={description}
                onSuccess={onSuccess}
                buttonText="Payer par carte"
              />
            </TabsContent>
            
            <TabsContent value="paypal" className="mt-0">
              <div className="flex flex-col items-center space-y-4 p-6">
                <p className="text-center text-gray-500 mb-4">
                  Cliquez sur le bouton ci-dessous pour payer avec PayPal.
                </p>
                <PayPalCheckoutButton
                  amount={amount}
                  description={description}
                  onSuccess={onSuccess}
                  buttonText="Payer avec PayPal"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="bank" className="mt-0">
              <BankTransferDetails
                amount={amount}
                description={description}
                onSuccess={onSuccess}
              />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
