import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

// Types pour les codes promotionnels
export interface PromoCode {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  applies_to_service_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUse {
  id: number;
  promo_code_id: number;
  user_id: string;
  service_id: number | null;
  transaction_id: number | null;
  discount_amount: number;
  used_at: string;
}

export interface PromoCodeValidation {
  is_valid: boolean;
  message: string;
  discount_type: 'percentage' | 'fixed_amount' | null;
  discount_value: number | null;
  max_discount_amount: number | null;
  promo_code_id: number | null;
}

export interface PromoCodeApplication {
  success: boolean;
  message: string;
  discount_amount: number;
}

/**
 * Valide un code promotionnel
 * 
 * @param code - Le code promotionnel
 * @param userId - L'ID de l'utilisateur
 * @param serviceId - L'ID du service
 * @param amount - Le montant de l'achat
 * @returns Résultat de la validation
 */
export const validatePromoCode = async (
  code: string,
  userId: string,
  serviceId: number,
  amount: number
): Promise<ServiceResponse<PromoCodeValidation>> => {
  try {
    const { data, error } = await supabase
      .rpc('validate_promo_code', {
        p_code: code,
        p_user_id: userId,
        p_service_id: serviceId,
        p_amount: amount
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { success: false, error };
  }
};

/**
 * Applique un code promotionnel
 * 
 * @param code - Le code promotionnel
 * @param userId - L'ID de l'utilisateur
 * @param serviceId - L'ID du service
 * @param amount - Le montant de l'achat
 * @param transactionId - L'ID de la transaction
 * @returns Résultat de l'application
 */
export const applyPromoCode = async (
  code: string,
  userId: string,
  serviceId: number,
  amount: number,
  transactionId: number
): Promise<ServiceResponse<PromoCodeApplication>> => {
  try {
    const { data, error } = await supabase
      .rpc('apply_promo_code', {
        p_code: code,
        p_user_id: userId,
        p_service_id: serviceId,
        p_amount: amount,
        p_transaction_id: transactionId
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error applying promo code:', error);
    return { success: false, error };
  }
};

/**
 * Récupère tous les codes promotionnels actifs
 * 
 * @returns Liste des codes promotionnels actifs
 */
export const getActivePromoCodes = async (): Promise<ServiceResponse<PromoCode[]>> => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching active promo codes:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les utilisations de codes promotionnels d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des utilisations de codes promotionnels
 */
export const getUserPromoCodeUses = async (userId: string): Promise<ServiceResponse<PromoCodeUse[]>> => {
  try {
    const { data, error } = await supabase
      .from('promo_code_uses')
      .select(`
        *,
        promo_codes(code, description)
      `)
      .eq('user_id', userId)
      .order('used_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching promo code uses for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Calcule le montant de la remise pour un code promotionnel
 * 
 * @param validation - Résultat de la validation du code
 * @param amount - Montant de l'achat
 * @returns Montant de la remise
 */
export const calculateDiscount = (
  validation: PromoCodeValidation,
  amount: number
): number => {
  if (!validation.is_valid || !validation.discount_type || validation.discount_value === null) {
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
