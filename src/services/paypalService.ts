import { supabase } from '@/utils/supabase';

// Types pour les transactions PayPal
export interface PayPalTransaction {
  id: string;
  user_id: string;
  transaction_id: string;
  order_id?: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'payment' | 'subscription' | 'refund';
  description?: string;
  created_at: string;
  metadata?: any;
}

// Enregistrer une transaction PayPal
export const savePayPalTransaction = async (transaction: Omit<PayPalTransaction, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('paypal_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving PayPal transaction:', error);
    return { success: false, error };
  }
};

// Récupérer les transactions PayPal d'un utilisateur
export const getUserPayPalTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('paypal_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user PayPal transactions:', error);
    return { success: false, error };
  }
};

// Récupérer une transaction PayPal par ID
export const getPayPalTransactionById = async (transactionId: string) => {
  try {
    const { data, error } = await supabase
      .from('paypal_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching PayPal transaction:', error);
    return { success: false, error };
  }
};

// Mettre à jour le statut d'une transaction PayPal
export const updatePayPalTransactionStatus = async (transactionId: string, status: PayPalTransaction['status']) => {
  try {
    const { data, error } = await supabase
      .from('paypal_transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating PayPal transaction status:', error);
    return { success: false, error };
  }
};

// Enregistrer un remboursement PayPal
export const savePayPalRefund = async (
  userId: string,
  originalTransactionId: string,
  refundId: string,
  amount: number,
  currency: string,
  description?: string
) => {
  try {
    // Récupérer la transaction originale
    const { data: originalTransaction, error: fetchError } = await supabase
      .from('paypal_transactions')
      .select('*')
      .eq('transaction_id', originalTransactionId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Enregistrer le remboursement
    const refundTransaction: Omit<PayPalTransaction, 'id' | 'created_at'> = {
      user_id: userId,
      transaction_id: refundId,
      amount: amount,
      currency: currency,
      status: 'completed',
      type: 'refund',
      description: description || `Remboursement pour la transaction ${originalTransactionId}`,
      metadata: {
        original_transaction_id: originalTransactionId,
        original_order_id: originalTransaction.order_id
      }
    };
    
    const { data, error } = await supabase
      .from('paypal_transactions')
      .insert(refundTransaction)
      .select()
      .single();
    
    if (error) throw error;
    
    // Mettre à jour le statut de la transaction originale
    await updatePayPalTransactionStatus(originalTransaction.id, 'refunded');
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving PayPal refund:', error);
    return { success: false, error };
  }
};

// Vérifier si un utilisateur a un abonnement PayPal actif
export const hasActivePayPalSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('paypal_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .eq('status', 'completed')
      .not('subscription_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return { success: true, hasActiveSubscription: data && data.length > 0 };
  } catch (error) {
    console.error('Error checking active PayPal subscription:', error);
    return { success: false, error };
  }
};

// Annuler un abonnement PayPal
export const cancelPayPalSubscription = async (subscriptionId: string) => {
  try {
    // Dans une application réelle, vous feriez un appel à l'API PayPal ici
    // pour annuler l'abonnement côté PayPal
    
    // Mettre à jour le statut de l'abonnement dans la base de données
    const { data, error } = await supabase
      .from('paypal_transactions')
      .update({ status: 'failed' })
      .eq('subscription_id', subscriptionId)
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error cancelling PayPal subscription:', error);
    return { success: false, error };
  }
};
