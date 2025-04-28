import { ServiceResponse } from './index';

// Types pour Stripe
export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

/**
 * Crée une intention de paiement Stripe
 * 
 * @param amount - Le montant en centimes
 * @param currency - La devise (EUR, USD, etc.)
 * @param description - La description du paiement
 * @param metadata - Les métadonnées du paiement
 * @returns L'intention de paiement créée
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'eur',
  description: string = '',
  metadata: Record<string, string> = {}
): Promise<ServiceResponse<StripePaymentIntent>> => {
  try {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convertir en centimes
        currency,
        description,
        metadata,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de l\'intention de paiement');
    }
    
    const data = await response.json();
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, error };
  }
};

/**
 * Confirme une intention de paiement Stripe
 * 
 * @param paymentIntentId - L'ID de l'intention de paiement
 * @param paymentMethodId - L'ID de la méthode de paiement
 * @returns Le résultat de la confirmation
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<ServiceResponse<StripePaymentIntent>> => {
  try {
    const response = await fetch('/api/stripe/confirm-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la confirmation de l\'intention de paiement');
    }
    
    const data = await response.json();
    
    return { success: true, data };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les méthodes de paiement d'un client Stripe
 * 
 * @param customerId - L'ID du client Stripe
 * @returns Les méthodes de paiement du client
 */
export const getPaymentMethods = async (
  customerId: string
): Promise<ServiceResponse<StripePaymentMethod[]>> => {
  try {
    const response = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des méthodes de paiement');
    }
    
    const data = await response.json();
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return { success: false, error };
  }
};

/**
 * Ajoute une méthode de paiement à un client Stripe
 * 
 * @param customerId - L'ID du client Stripe
 * @param paymentMethodId - L'ID de la méthode de paiement
 * @returns La méthode de paiement ajoutée
 */
export const addPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<ServiceResponse<StripePaymentMethod>> => {
  try {
    const response = await fetch('/api/stripe/add-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'ajout de la méthode de paiement');
    }
    
    const data = await response.json();
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding payment method:', error);
    return { success: false, error };
  }
};

/**
 * Supprime une méthode de paiement
 * 
 * @param paymentMethodId - L'ID de la méthode de paiement
 * @returns Le résultat de la suppression
 */
export const removePaymentMethod = async (
  paymentMethodId: string
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const response = await fetch('/api/stripe/remove-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la suppression de la méthode de paiement');
    }
    
    const data = await response.json();
    
    return { success: true, data };
  } catch (error) {
    console.error('Error removing payment method:', error);
    return { success: false, error };
  }
};
