import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface TwoFactorAuthProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  email: string;
}

/**
 * Composant d'authentification à deux facteurs
 * 
 * @param onVerify - Fonction appelée lors de la vérification du code
 * @param onCancel - Fonction appelée lors de l'annulation
 * @param email - Email de l'utilisateur
 */
export default function TwoFactorAuth({ onVerify, onCancel, email }: TwoFactorAuthProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer pour le code d'expiration
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Focus sur le premier input au chargement
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Accepter uniquement les chiffres
    if (value && !/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Passer au champ suivant si un chiffre est entré
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retourner au champ précédent sur Backspace si le champ actuel est vide
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Vérifier si le texte collé contient uniquement des chiffres
    if (!/^\d+$/.test(pastedData)) return;
    
    // Remplir les champs avec les chiffres collés
    const digits = pastedData.split('').slice(0, 6);
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setCode(newCode);
    
    // Focus sur le dernier champ rempli ou le suivant
    const focusIndex = Math.min(digits.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast({
        title: "Code incomplet",
        description: "Veuillez entrer les 6 chiffres du code",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      const success = await onVerify(fullCode);
      if (!success) {
        toast({
          title: "Code incorrect",
          description: "Le code que vous avez entré est incorrect. Veuillez réessayer.",
          variant: "destructive",
        });
        // Réinitialiser le code
        setCode(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      toast({
        title: "Erreur de vérification",
        description: "Une erreur s'est produite lors de la vérification du code. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    // Réinitialiser le timer
    setTimeLeft(30);
    
    toast({
      title: "Code envoyé",
      description: `Un nouveau code a été envoyé à ${email}`,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Vérification en deux étapes
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>. 
        Veuillez entrer ce code pour continuer.
      </p>
      
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-tontine-purple dark:bg-gray-700 dark:text-white"
            disabled={isVerifying}
          />
        ))}
      </div>
      
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleVerify}
          disabled={isVerifying || code.some(digit => !digit)}
          className="w-full bg-tontine-purple hover:bg-tontine-dark-purple"
        >
          {isVerifying ? "Vérification..." : "Vérifier"}
        </Button>
        
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isVerifying}
          className="w-full"
        >
          Annuler
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Vous n'avez pas reçu de code?
        </p>
        <button
          onClick={handleResendCode}
          disabled={timeLeft > 0 || isVerifying}
          className="text-sm font-medium text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {timeLeft > 0 ? `Renvoyer le code (${timeLeft}s)` : "Renvoyer le code"}
        </button>
      </div>
    </div>
  );
}
