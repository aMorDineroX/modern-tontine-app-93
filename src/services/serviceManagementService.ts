import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

// Types pour les services
export interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: string;
  is_recurring: boolean;
  recurring_interval: 'day' | 'week' | 'month' | 'year' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFeature {
  id: number;
  service_id: number;
  name: string;
  description: string;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSubscription {
  id: number;
  user_id: string;
  service_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string | null;
  last_payment_date: string;
  next_payment_date: string | null;
  payment_method: string;
  payment_reference: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceTransaction {
  id: number;
  user_id: string;
  service_id: number;
  subscription_id: number | null;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  payment_reference: string;
  created_at: string;
  updated_at: string;
}

export interface UserService {
  service_id: number;
  service_name: string;
  service_description: string;
  service_icon: string;
  subscription_status: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_active: boolean;
}

export interface ServiceWithFeatures extends Service {
  features: ServiceFeature[];
}

/**
 * Récupère tous les services disponibles
 * 
 * @returns Liste des services disponibles
 */
export const getAllServices = async (): Promise<ServiceResponse<Service[]>> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { success: false, error };
  }
};

/**
 * Récupère un service par son ID
 * 
 * @param serviceId - L'ID du service
 * @returns Le service demandé
 */
export const getServiceById = async (serviceId: number): Promise<ServiceResponse<ServiceWithFeatures>> => {
  try {
    // Récupérer le service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError) throw serviceError;
    
    // Récupérer les fonctionnalités du service
    const { data: features, error: featuresError } = await supabase
      .from('service_features')
      .select('*')
      .eq('service_id', serviceId)
      .order('is_highlighted', { ascending: false });
    
    if (featuresError) throw featuresError;
    
    const serviceWithFeatures: ServiceWithFeatures = {
      ...service,
      features: features || []
    };
    
    return { success: true, data: serviceWithFeatures };
  } catch (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les services d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des services de l'utilisateur
 */
export const getUserServices = async (userId: string): Promise<ServiceResponse<UserService[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_services', { p_user_id: userId });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching services for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * S'abonne à un service
 * 
 * @param userId - L'ID de l'utilisateur
 * @param serviceId - L'ID du service
 * @param paymentMethod - La méthode de paiement
 * @param paymentReference - La référence du paiement
 * @returns L'ID de l'abonnement créé
 */
export const subscribeToService = async (
  userId: string,
  serviceId: number,
  paymentMethod: string,
  paymentReference: string
): Promise<ServiceResponse<number>> => {
  try {
    const { data, error } = await supabase
      .rpc('subscribe_to_service', {
        p_user_id: userId,
        p_service_id: serviceId,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error subscribing user ${userId} to service ${serviceId}:`, error);
    return { success: false, error };
  }
};

/**
 * Annule un abonnement à un service
 * 
 * @param userId - L'ID de l'utilisateur
 * @param subscriptionId - L'ID de l'abonnement
 * @returns Succès ou échec de l'opération
 */
export const cancelServiceSubscription = async (
  userId: string,
  subscriptionId: number
): Promise<ServiceResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .rpc('cancel_service_subscription', {
        p_user_id: userId,
        p_subscription_id: subscriptionId
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error cancelling subscription ${subscriptionId} for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les transactions de service d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des transactions de l'utilisateur
 */
export const getUserServiceTransactions = async (userId: string): Promise<ServiceResponse<ServiceTransaction[]>> => {
  try {
    const { data, error } = await supabase
      .from('service_transactions')
      .select(`
        *,
        services(name, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching service transactions for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les abonnements actifs d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des abonnements actifs de l'utilisateur
 */
export const getUserActiveSubscriptions = async (userId: string): Promise<ServiceResponse<ServiceSubscription[]>> => {
  try {
    const { data, error } = await supabase
      .from('service_subscriptions')
      .select(`
        *,
        services(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching active subscriptions for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Vérifie si un utilisateur est abonné à un service
 * 
 * @param userId - L'ID de l'utilisateur
 * @param serviceId - L'ID du service
 * @returns Vrai si l'utilisateur est abonné, faux sinon
 */
export const isUserSubscribedToService = async (
  userId: string,
  serviceId: number
): Promise<ServiceResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .from('service_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) throw error;
    
    return { success: true, data: !!data };
  } catch (error) {
    console.error(`Error checking if user ${userId} is subscribed to service ${serviceId}:`, error);
    return { success: false, error };
  }
};
