import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

export interface UserFeedback {
  id?: string;
  feature_id: string;
  feature_name: string;
  rating: number;
  usability?: string;
  feedback?: string;
  email?: string;
  user_id?: string;
  contact_consent: boolean;
  created_at?: string;
}

export interface FeedbackStats {
  feature_id: string;
  average_rating: number;
  total_feedback: number;
  rating_distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  usability_distribution: {
    very_easy: number;
    easy: number;
    neutral: number;
    difficult: number;
    very_difficult: number;
  };
}

/**
 * Soumet un feedback utilisateur
 * 
 * @param feedback - Les données du feedback
 * @returns L'ID du feedback créé
 */
export const submitFeedback = async (feedback: UserFeedback): Promise<ServiceResponse<string>> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .insert(feedback)
      .select('id')
      .single();
      
    if (error) throw error;
    
    return { success: true, data: data.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les feedbacks d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des feedbacks de l'utilisateur
 */
export const getUserFeedbacks = async (userId: string): Promise<ServiceResponse<UserFeedback[]>> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user feedbacks:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les statistiques de feedback pour une fonctionnalité
 * 
 * @param featureId - L'ID de la fonctionnalité
 * @returns Statistiques de feedback
 */
export const getFeatureFeedbackStats = async (featureId: string): Promise<ServiceResponse<FeedbackStats>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_feature_feedback_stats', { p_feature_id: featureId });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feature feedback stats:', error);
    return { success: false, error };
  }
};

/**
 * Récupère tous les feedbacks pour une fonctionnalité
 * 
 * @param featureId - L'ID de la fonctionnalité
 * @returns Liste des feedbacks pour la fonctionnalité
 */
export const getFeatureFeedbacks = async (featureId: string): Promise<ServiceResponse<UserFeedback[]>> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feature feedbacks:', error);
    return { success: false, error };
  }
};
