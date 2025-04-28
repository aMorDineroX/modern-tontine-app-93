import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, CheckCircle2, Info, Banknote } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BankTransferDetailsProps {
  amount: number;
  description: string;
  onSuccess: (details: any) => void;
  className?: string;
}

/**
 * Composant pour afficher les détails de virement bancaire
 * 
 * @component
 * @param {BankTransferDetailsProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant BankTransferDetails
 */
export default function BankTransferDetails({
  amount,
  description,
  onSuccess,
  className = ""
}: BankTransferDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  
  const { formatAmount } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Générer une référence unique pour le virement
  const transferReference = `NAAT-${user?.id?.substring(0, 8) || 'USER'}-${Date.now().toString().substring(7)}`;
  
  // Informations bancaires fictives
  const bankDetails = {
    accountName: "Naat Finance SAS",
    iban: "FR76 3000 6000 0123 4567 8901 234",
    bic: "AGRIFRPP",
    bankName: "Crédit Agricole",
    reference: transferReference
  };
  
  // Copier dans le presse-papier
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "Copié !",
        description: "Le texte a été copié dans le presse-papier",
      });
    });
  };
  
  // Simuler la confirmation du virement
  const handleConfirmTransfer = () => {
    // Dans une vraie implémentation, cela enregistrerait le virement en attente
    // et enverrait une notification à l'administrateur
    
    const paymentDetails = {
      id: transferReference,
      amount: amount,
      currency: 'eur',
      status: 'pending',
      payment_method: 'bank_transfer',
      reference: transferReference
    };
    
    onSuccess(paymentDetails);
    
    toast({
      title: "Virement enregistré",
      description: "Nous avons enregistré votre demande de virement. Votre abonnement sera activé dès réception du paiement.",
    });
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
  
  const detailItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.1 + (i * 0.1),
        duration: 0.3
      }
    })
  };
  
  return (
    <motion.div 
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Paiement par virement bancaire</CardTitle>
          <CardDescription>Effectuez un virement bancaire avec les informations ci-dessous</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Information importante</AlertTitle>
            <AlertDescription>
              Votre abonnement sera activé dès réception du virement. Ce processus peut prendre 1 à 3 jours ouvrés.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Montant à payer</span>
              <span className="font-medium">{formatAmount(amount)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{description}</div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Coordonnées bancaires</h3>
            
            <motion.div 
              className="flex justify-between items-center py-2 border-b"
              variants={detailItemVariants}
              custom={0}
            >
              <div>
                <p className="text-sm text-gray-500">Bénéficiaire</p>
                <p className="font-medium">{bankDetails.accountName}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
              >
                {copied === 'accountName' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex justify-between items-center py-2 border-b"
              variants={detailItemVariants}
              custom={1}
            >
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p className="font-medium">{bankDetails.iban}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
              >
                {copied === 'iban' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex justify-between items-center py-2 border-b"
              variants={detailItemVariants}
              custom={2}
            >
              <div>
                <p className="text-sm text-gray-500">BIC/SWIFT</p>
                <p className="font-medium">{bankDetails.bic}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(bankDetails.bic, 'bic')}
              >
                {copied === 'bic' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex justify-between items-center py-2 border-b"
              variants={detailItemVariants}
              custom={3}
            >
              <div>
                <p className="text-sm text-gray-500">Banque</p>
                <p className="font-medium">{bankDetails.bankName}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(bankDetails.bankName, 'bankName')}
              >
                {copied === 'bankName' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex justify-between items-center py-2"
              variants={detailItemVariants}
              custom={4}
            >
              <div>
                <p className="text-sm text-gray-500">Référence (important)</p>
                <p className="font-medium">{bankDetails.reference}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(bankDetails.reference, 'reference')}
              >
                {copied === 'reference' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConfirmTransfer}
            className="w-full"
          >
            <Banknote className="h-4 w-4 mr-2" />
            J'ai effectué le virement
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
