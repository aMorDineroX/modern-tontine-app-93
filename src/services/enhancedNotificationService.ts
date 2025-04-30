import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

/**
 * S'abonne aux notifications en temps réel pour un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param callback - Fonction appelée lorsqu'une nouvelle notification est reçue
 * @returns L'abonnement Supabase
 */
export const subscribeToUserNotifications = (userId: string, callback: (notification: Notification) => void) => {
  return supabase
    .channel(`user-notifications-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      callback(payload.new as Notification);
    })
    .subscribe();
};

/**
 * Récupère les notifications d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des notifications
 */
export const getUserNotifications = async (userId: string): Promise<ServiceResponse<Notification[]>> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error };
  }
};

/**
 * Marque une notification comme lue
 * 
 * @param notificationId - L'ID de la notification
 * @returns Succès ou échec de l'opération
 */
export const markNotificationAsRead = async (notificationId: string): Promise<ServiceResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    
    return { success: true, data: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Succès ou échec de l'opération
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<ServiceResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
      
    if (error) throw error;
    
    return { success: true, data: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};

/**
 * Crée une nouvelle notification pour un utilisateur
 * 
 * @param notification - Les données de la notification
 * @returns L'ID de la notification créée
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<ServiceResponse<string>> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select('id')
      .single();
      
    if (error) throw error;
    
    return { success: true, data: data.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};
