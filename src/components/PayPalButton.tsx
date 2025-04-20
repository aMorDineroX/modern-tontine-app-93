
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  description?: string;
  isRecurring?: boolean;
  recurringFrequency?: "day" | "week" | "month" | "year";
  recurringCycles?: number;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({
  amount,
  currency = "EUR",
  onSuccess,
  onError,
  onCancel,
  description = "Paiement Naat",
  isRecurring = false,
  recurringFrequency = "month",
  recurringCycles = 0 // 0 = until cancelled
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { formatAmount } = useApp();

  // Charger le script PayPal
  useEffect(() => {
    const loadPayPalScript = () => {
      // Vérifier si le script est déjà chargé
      if (window.paypal) {
        setScriptLoaded(true);
        setIsLoading(false);
        return;
      }

      // Créer le script
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID || "sb"}&currency=${currency}`;
      script.async = true;

      script.onload = () => {
        setScriptLoaded(true);
        setIsLoading(false);
      };

      script.onerror = () => {
        setError("Impossible de charger le script PayPal");
        setIsLoading(false);

        toast({
          title: "Erreur PayPal",
          description: "Impossible de charger le service PayPal",
          variant: "destructive",
        });
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();

    // Nettoyage
    return () => {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript && existingScript.parentNode) {
        // Ne pas supprimer le script pour éviter des problèmes de rechargement
        // existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [currency, toast]);

  // Rendre le bouton PayPal
  useEffect(() => {
    if (scriptLoaded && paypalButtonRef.current && window.paypal) {
      // Nettoyer le conteneur
      paypalButtonRef.current.innerHTML = '';

      try {
        if (isRecurring) {
          // Configuration pour les paiements récurrents
          window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'subscribe'
            },
            createSubscription: (data: any, actions: any) => {
              return actions.subscription.create({
                plan_id: process.env.PAYPAL_PLAN_ID || 'P-DUMMY_PLAN_ID',
                // Ou créer un plan dynamiquement
                /* application_context: {
                  shipping_preference: 'NO_SHIPPING'
                },
                plan: {
                  name: `Contribution Naat - ${description}`,
                  description: `Paiement récurrent pour ${description}`,
                  billing_cycles: [
                    {
                      frequency: {
                        interval_unit: recurringFrequency.toUpperCase(),
                        interval_count: 1
                      },
                      tenure_type: 'REGULAR',
                      sequence: 1,
                      total_cycles: recurringCycles,
                      pricing_scheme: {
                        fixed_price: {
                          value: amount.toString(),
                          currency_code: currency
                        }
                      }
                    }
                  ],
                  payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee: {
                      value: '0',
                      currency_code: currency
                    },
                    setup_fee_failure_action: 'CONTINUE',
                    payment_failure_threshold: 3
                  }
                } */
              });
            },
            onApprove: (data: any, actions: any) => {
              toast({
                title: "Abonnement activé",
                description: `Votre abonnement a été activé avec succès. ID: ${data.subscriptionID}`,
              });

              if (onSuccess) {
                onSuccess({
                  status: "SUBSCRIPTION_CREATED",
                  subscriptionID: data.subscriptionID,
                  amount: amount,
                  isRecurring: true
                });
              }

              return true;
            },
            onCancel: () => {
              toast({
                title: "Abonnement annulé",
                description: "Vous avez annulé la création de l'abonnement",
                variant: "destructive",
              });

              if (onCancel) {
                onCancel();
              }
            },
            onError: (err: any) => {
              console.error("Erreur PayPal:", err);
              toast({
                title: "Erreur d'abonnement",
                description: "Une erreur est survenue lors de la création de l'abonnement",
                variant: "destructive",
              });

              if (onError) {
                onError(err);
              }
            }
          }).render(paypalButtonRef.current);
        } else {
          // Configuration pour les paiements uniques
          window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay'
            },
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: description,
                    amount: {
                      currency_code: currency,
                      value: amount.toString()
                    }
                  }
                ],
                application_context: {
                  shipping_preference: 'NO_SHIPPING'
                }
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const details = await actions.order.capture();

                toast({
                  title: "Paiement réussi",
                  description: `Votre paiement de ${formatAmount(amount)} a été effectué avec succès via PayPal`,
                });

                if (onSuccess) {
                  onSuccess({
                    status: "COMPLETED",
                    orderID: data.orderID,
                    payerID: data.payerID,
                    paymentID: details.id,
                    amount: amount,
                    details: details
                  });
                }

                return true;
              } catch (error) {
                console.error("Erreur lors de la capture du paiement:", error);
                toast({
                  title: "Erreur de paiement",
                  description: "Une erreur est survenue lors de la finalisation du paiement",
                  variant: "destructive",
                });

                if (onError) {
                  onError(error);
                }

                return false;
              }
            },
            onCancel: () => {
              toast({
                title: "Paiement annulé",
                description: "Vous avez annulé le paiement",
                variant: "destructive",
              });

              if (onCancel) {
                onCancel();
              }
            },
            onError: (err: any) => {
              console.error("Erreur PayPal:", err);
              toast({
                title: "Erreur de paiement",
                description: "Une erreur est survenue lors du paiement PayPal",
                variant: "destructive",
              });

              if (onError) {
                onError(err);
              }
            }
          }).render(paypalButtonRef.current);
        }
      } catch (renderError) {
        console.error("Erreur lors du rendu du bouton PayPal:", renderError);
        setError("Impossible de rendre le bouton PayPal");

        toast({
          title: "Erreur PayPal",
          description: "Impossible d'initialiser le bouton PayPal",
          variant: "destructive",
        });
      }
    }
  }, [scriptLoaded, amount, currency, description, isRecurring, recurringFrequency, recurringCycles, onSuccess, onError, onCancel, toast, formatAmount]);

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="w-full h-12 bg-gray-100 rounded-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0070BA] border-t-transparent" />
          <span className="ml-2 text-sm text-gray-600">Chargement de PayPal...</span>
        </div>
      )}
      <div ref={paypalButtonRef} className={`${isLoading ? 'hidden' : 'block'}`}></div>
    </div>
  );
}
