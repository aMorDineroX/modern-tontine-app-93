import { supabase } from '@/utils/supabase';

// Types pour les notifications
export enum NotificationType {
  PAYMENT_DUE = 'payment_due',
  PAYMENT_RECEIVED = 'payment_received',
  PAYOUT_SENT = 'payout_sent',
  GROUP_INVITATION = 'group_invitation',
  GROUP_UPDATE = 'group_update',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push'
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
  channel: NotificationChannel;
}

/**
 * Crée une nouvelle notification
 * 
 * @param notification - Les données de la notification sans id et created_at
 * @returns La notification créée
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>
): Promise<{ success: boolean; data?: Notification; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Si la notification doit être envoyée par d'autres canaux que in-app
    if (notification.channel !== NotificationChannel.IN_APP) {
      await sendNotificationByChannel(data, notification.channel);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les notifications d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param limit - Le nombre maximum de notifications à récupérer
 * @param onlyUnread - Si true, ne récupère que les notifications non lues
 * @returns Les notifications de l'utilisateur
 */
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  onlyUnread: boolean = false
): Promise<{ success: boolean; data?: Notification[]; error?: any }> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', NotificationChannel.IN_APP)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (onlyUnread) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { success: false, error };
  }
};

/**
 * Marque une notification comme lue
 * 
 * @param notificationId - L'ID de la notification
 * @returns La notification mise à jour
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; data?: Notification; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Le nombre de notifications mises à jour
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; count?: number; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    return { success: true, count: data.length };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};

/**
 * Supprime une notification
 * 
 * @param notificationId - L'ID de la notification
 * @returns Succès ou échec
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification par le canal spécifié
 * 
 * @param notification - La notification à envoyer
 * @param channel - Le canal par lequel envoyer la notification
 * @returns Succès ou échec
 */
const sendNotificationByChannel = async (
  notification: Notification,
  channel: NotificationChannel
): Promise<{ success: boolean; error?: any }> => {
  try {
    switch (channel) {
      case NotificationChannel.EMAIL:
        // Implémentation de l'envoi par email
        console.log(`Sending email notification to user ${notification.user_id}: ${notification.title}`);
        // Ici, vous pourriez utiliser un service d'email comme SendGrid, Mailchimp, etc.
        break;
      
      case NotificationChannel.SMS:
        // Implémentation de l'envoi par SMS
        console.log(`Sending SMS notification to user ${notification.user_id}: ${notification.title}`);
        // Ici, vous pourriez utiliser un service SMS comme Twilio, Nexmo, etc.
        break;
      
      case NotificationChannel.WHATSAPP:
        // Implémentation de l'envoi par WhatsApp
        console.log(`Sending WhatsApp notification to user ${notification.user_id}: ${notification.title}`);
        // Ici, vous pourriez utiliser l'API WhatsApp Business
        break;
      
      case NotificationChannel.PUSH:
        // Implémentation de l'envoi par notification push
        console.log(`Sending push notification to user ${notification.user_id}: ${notification.title}`);
        // Ici, vous pourriez utiliser Firebase Cloud Messaging ou un autre service de push
        break;
      
      default:
        console.log(`Unknown notification channel: ${channel}`);
        break;
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error sending notification through ${channel}:`, error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification de paiement dû
 * 
 * @param userId - L'ID de l'utilisateur
 * @param groupId - L'ID du groupe
 * @param amount - Le montant dû
 * @param dueDate - La date d'échéance
 * @param channels - Les canaux par lesquels envoyer la notification
 * @returns La notification créée
 */
export const sendPaymentDueNotification = async (
  userId: string,
  groupId: number,
  groupName: string,
  amount: number,
  dueDate: string,
  channels: NotificationChannel[] = [NotificationChannel.IN_APP]
): Promise<{ success: boolean; data?: Notification[]; error?: any }> => {
  try {
    const title = `Paiement à effectuer pour ${groupName}`;
    const message = `Vous avez un paiement de ${amount} à effectuer pour le groupe "${groupName}" avant le ${new Date(dueDate).toLocaleDateString()}.`;
    
    const notifications = await Promise.all(
      channels.map(channel => 
        createNotification({
          user_id: userId,
          type: NotificationType.PAYMENT_DUE,
          title,
          message,
          channel,
          metadata: {
            group_id: groupId,
            amount,
            due_date: dueDate
          }
        })
      )
    );
    
    const success = notifications.every(n => n.success);
    const data = notifications.map(n => n.data).filter(Boolean) as Notification[];
    
    return { success, data };
  } catch (error) {
    console.error('Error sending payment due notification:', error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification d'invitation à un groupe
 * 
 * @param userId - L'ID de l'utilisateur
 * @param groupId - L'ID du groupe
 * @param groupName - Le nom du groupe
 * @param inviterName - Le nom de l'inviteur
 * @param channels - Les canaux par lesquels envoyer la notification
 * @returns La notification créée
 */
export const sendGroupInvitationNotification = async (
  userId: string,
  groupId: number,
  groupName: string,
  inviterName: string,
  channels: NotificationChannel[] = [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
): Promise<{ success: boolean; data?: Notification[]; error?: any }> => {
  try {
    const title = `Invitation au groupe ${groupName}`;
    const message = `${inviterName} vous a invité à rejoindre le groupe "${groupName}".`;
    
    const notifications = await Promise.all(
      channels.map(channel => 
        createNotification({
          user_id: userId,
          type: NotificationType.GROUP_INVITATION,
          title,
          message,
          channel,
          metadata: {
            group_id: groupId,
            inviter_name: inviterName
          }
        })
      )
    );
    
    const success = notifications.every(n => n.success);
    const data = notifications.map(n => n.data).filter(Boolean) as Notification[];
    
    return { success, data };
  } catch (error) {
    console.error('Error sending group invitation notification:', error);
    return { success: false, error };
  }
};

/**
 * Envoie une notification personnalisée
 * 
 * @param userId - L'ID de l'utilisateur
 * @param title - Le titre de la notification
 * @param message - Le message de la notification
 * @param metadata - Les métadonnées de la notification
 * @param channels - Les canaux par lesquels envoyer la notification
 * @returns La notification créée
 */
export const sendCustomNotification = async (
  userId: string,
  title: string,
  message: string,
  metadata?: any,
  channels: NotificationChannel[] = [NotificationChannel.IN_APP]
): Promise<{ success: boolean; data?: Notification[]; error?: any }> => {
  try {
    const notifications = await Promise.all(
      channels.map(channel => 
        createNotification({
          user_id: userId,
          type: NotificationType.CUSTOM,
          title,
          message,
          channel,
          metadata
        })
      )
    );
    
    const success = notifications.every(n => n.success);
    const data = notifications.map(n => n.data).filter(Boolean) as Notification[];
    
    return { success, data };
  } catch (error) {
    console.error('Error sending custom notification:', error);
    return { success: false, error };
  }
};
