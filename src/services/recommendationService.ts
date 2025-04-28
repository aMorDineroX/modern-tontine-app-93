import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

// Types pour les recommandations
export interface ServiceRecommendation {
  service_id: number;
  service_name: string;
  service_description: string;
  service_icon: string;
  service_price: number;
  service_currency: string;
  service_is_recurring: boolean;
  service_recurring_interval: string | null;
  recommendation_score: number;
  recommendation_reason: 'history' | 'similar_users' | 'popular' | 'bundle';
}

// Types pour les interactions
export type InteractionType = 'view' | 'click' | 'subscribe' | 'cancel';

/**
 * Enregistre une interaction avec un service
 * 
 * @param userId - L'ID de l'utilisateur
 * @param serviceId - L'ID du service
 * @param interactionType - Le type d'interaction
 * @returns Succès ou échec de l'opération
 */
export const recordServiceInteraction = async (
  userId: string,
  serviceId: number,
  interactionType: InteractionType
): Promise<ServiceResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .rpc('record_service_interaction', {
        p_user_id: userId,
        p_service_id: serviceId,
        p_interaction_type: interactionType
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error recording service interaction for user ${userId} with service ${serviceId}:`, error);
    return { success: false, error };
  }
};

/**
 * Génère des recommandations pour un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Succès ou échec de l'opération
 */
export const generateServiceRecommendations = async (
  userId: string
): Promise<ServiceResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .rpc('generate_service_recommendations', {
        p_user_id: userId
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error generating service recommendations for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Récupère les recommandations pour un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param limit - Le nombre maximum de recommandations à récupérer
 * @returns Les recommandations de services
 */
export const getUserServiceRecommendations = async (
  userId: string,
  limit: number = 5
): Promise<ServiceResponse<ServiceRecommendation[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_service_recommendations', {
        p_user_id: userId,
        p_limit: limit
      });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error getting service recommendations for user ${userId}:`, error);
    return { success: false, error };
  }
};

/**
 * Traduit la raison de la recommandation en texte lisible
 * 
 * @param reason - La raison de la recommandation
 * @returns Texte explicatif de la recommandation
 */
export const getRecommendationReasonText = (reason: string): string => {
  switch (reason) {
    case 'history':
      return 'Basé sur votre historique';
    case 'similar_users':
      return 'Les utilisateurs similaires aiment aussi';
    case 'popular':
      return 'Populaire auprès des utilisateurs';
    case 'bundle':
      return 'Offre groupée avec remise';
    default:
      return 'Recommandé pour vous';
  }
};

/**
 * Récupère les offres groupées disponibles
 * 
 * @returns Les offres groupées
 */
export const getServiceBundles = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('service_bundles')
      .select(`
        id,
        name,
        description,
        service_id,
        discount_percentage,
        is_active,
        services:service_id (
          id,
          name,
          description,
          icon,
          price,
          currency,
          is_recurring,
          recurring_interval
        ),
        bundle_items:service_bundle_items (
          service_id,
          services:service_id (
            id,
            name,
            description,
            icon,
            price,
            currency,
            is_recurring,
            recurring_interval
          )
        )
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting service bundles:', error);
    return { success: false, error };
  }
};
