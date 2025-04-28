import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

// Types pour le programme de fidélité
export interface LoyaltyAccount {
  user_id: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  next_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_to_next_tier: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  points: number;
  transaction_type: string;
  reference_id: number | null;
  description: string | null;
  created_at: string;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  reward_value: any;
  min_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_available: boolean;
  reason_if_unavailable: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface LoyaltyRewardClaim {
  claim_id: number;
  reward_id: number;
  reward_name: string;
  reward_description: string;
  reward_type: string;
  reward_value: any;
  points_spent: number;
  status: 'claimed' | 'used' | 'expired' | 'cancelled';
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
}

/**
 * Récupère le compte de fidélité d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Le compte de fidélité
 */
export const getLoyaltyAccount = async (
  userId: string
): Promise<ServiceResponse<LoyaltyAccount>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_loyalty_account', {
        p_user_id: userId
      });
    
    if (error) throw error;
    
    return { success: true, data: data[0] };
  } catch (error) {
    console.error(`Error getting loyalty account for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère l'historique des transactions de points d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param limit - Le nombre maximum de transactions à récupérer
 * @param offset - Le décalage pour la pagination
 * @returns Les transactions de points
 */
export const getLoyaltyTransactions = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ServiceResponse<LoyaltyTransaction[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_loyalty_transactions', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error getting loyalty transactions for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les récompenses disponibles pour un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param limit - Le nombre maximum de récompenses à récupérer
 * @param offset - Le décalage pour la pagination
 * @returns Les récompenses disponibles
 */
export const getAvailableLoyaltyRewards = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ServiceResponse<LoyaltyReward[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_available_loyalty_rewards', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error getting available loyalty rewards for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les récompenses réclamées par un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param limit - Le nombre maximum de récompenses à récupérer
 * @param offset - Le décalage pour la pagination
 * @returns Les récompenses réclamées
 */
export const getUserLoyaltyRewardClaims = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ServiceResponse<LoyaltyRewardClaim[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_loyalty_reward_claims', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error getting loyalty reward claims for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Réclame une récompense
 * 
 * @param userId - L'ID de l'utilisateur
 * @param rewardId - L'ID de la récompense
 * @returns L'ID de la réclamation
 */
export const claimLoyaltyReward = async (
  userId: string,
  rewardId: number
): Promise<ServiceResponse<number>> => {
  try {
    const { data, error } = await supabase
      .rpc('claim_loyalty_reward', {
        p_user_id: userId,
        p_reward_id: rewardId
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error claiming loyalty reward ${rewardId} for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Traduit le niveau de fidélité en texte lisible
 * 
 * @param tier - Le niveau de fidélité
 * @returns Texte du niveau de fidélité
 */
export const getLoyaltyTierText = (tier: string): string => {
  switch (tier) {
    case 'bronze':
      return 'Bronze';
    case 'silver':
      return 'Argent';
    case 'gold':
      return 'Or';
    case 'platinum':
      return 'Platine';
    default:
      return 'Inconnu';
  }
};

/**
 * Traduit le type de transaction en texte lisible
 * 
 * @param transactionType - Le type de transaction
 * @returns Texte du type de transaction
 */
export const getTransactionTypeText = (transactionType: string): string => {
  switch (transactionType) {
    case 'subscription':
      return 'Abonnement';
    case 'referral':
      return 'Parrainage';
    case 'reward':
      return 'Récompense';
    case 'expiration':
      return 'Expiration';
    default:
      return 'Autre';
  }
};
