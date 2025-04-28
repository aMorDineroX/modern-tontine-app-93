import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Tag } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { validatePromoCode, PromoCodeValidation } from "@/services/promoCodeService";

interface PromoCodeInputProps {
  serviceId: number;
  amount: number;
  onValidPromoCode: (validation: PromoCodeValidation) => void;
  className?: string;
}

/**
 * Composant pour saisir et valider un code promotionnel
 * 
 * @component
 * @param {PromoCodeInputProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant PromoCodeInput
 */
export default function PromoCodeInput({
  serviceId,
  amount,
  onValidPromoCode,
  className = ""
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validation, setValidation] = useState<PromoCodeValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { formatAmount } = useApp();
  const { user } = useAuth();
  
  // Valider le code promotionnel
  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) {
      setError("Veuillez saisir un code promotionnel");
      return;
    }
    
    if (!user) {
      setError("Vous devez être connecté pour utiliser un code promotionnel");
      return;
    }
    
    setIsValidating(true);
    setError(null);
    setValidation(null);
    
    try {
      const { success, data, error: apiError } = await validatePromoCode(
        promoCode.trim(),
        user.id,
        serviceId,
        amount
      );
      
      if (!success || !data) {
        throw apiError || new Error("Erreur lors de la validation du code promotionnel");
      }
      
      setValidation(data);
      
      if (data.is_valid) {
        onValidPromoCode(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code promotionnel:", error);
      setError("Une erreur est survenue lors de la validation du code promotionnel");
    } finally {
      setIsValidating(false);
    }
  };
  
  // Calculer le montant de la remise
  const calculateDiscount = () => {
    if (!validation || !validation.is_valid || !validation.discount_type || validation.discount_value === null) {
      return 0;
    }
    
    let discountAmount = 0;
    
    if (validation.discount_type === 'percentage') {
      discountAmount = amount * (validation.discount_value / 100);
      
      // Appliquer le montant maximum de remise si nécessaire
      if (validation.max_discount_amount !== null && discountAmount > validation.max_discount_amount) {
        discountAmount = validation.max_discount_amount;
      }
    } else { // 'fixed_amount'
      discountAmount = validation.discount_value;
      
      // S'assurer que la remise ne dépasse pas le montant total
      if (discountAmount > amount) {
        discountAmount = amount;
      }
    }
    
    return discountAmount;
  };
  
  // Formater la remise
  const formatDiscount = () => {
    if (!validation || !validation.is_valid || !validation.discount_type || validation.discount_value === null) {
      return "";
    }
    
    if (validation.discount_type === 'percentage') {
      return `${validation.discount_value}%`;
    } else { // 'fixed_amount'
      return formatAmount(validation.discount_value);
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
  
  const resultVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { 
      opacity: 1, 
      height: "auto", 
      marginTop: 16,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      marginTop: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div 
      className={`space-y-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-2">
        <Label htmlFor="promo-code">Code promotionnel</Label>
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="promo-code"
              type="text"
              placeholder="Saisir un code promotionnel"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="pl-9"
              disabled={isValidating || (validation?.is_valid === true)}
            />
          </div>
          <Button 
            onClick={handleValidatePromoCode}
            disabled={isValidating || !promoCode.trim() || (validation?.is_valid === true)}
            variant={validation?.is_valid ? "outline" : "default"}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : validation?.is_valid ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            ) : null}
            {validation?.is_valid ? "Appliqué" : "Appliquer"}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {validation?.is_valid && (
          <motion.div
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Code promotionnel appliqué</AlertTitle>
              <AlertDescription>
                <p>Remise de {formatDiscount()} appliquée.</p>
                <p className="font-medium mt-1">
                  Vous économisez {formatAmount(calculateDiscount())}
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
