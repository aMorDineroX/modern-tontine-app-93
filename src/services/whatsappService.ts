import { supabase } from '@/utils/supabase';

// Types pour WhatsApp
export interface WhatsAppMessage {
  id: string;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface WhatsAppContact {
  id: string;
  user_id: string;
  phone_number: string;
  name: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Envoie un message WhatsApp
 * 
 * @param phoneNumber - Le numéro de téléphone du destinataire
 * @param message - Le message à envoyer
 * @param metadata - Les métadonnées du message
 * @returns Le message envoyé
 */
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string,
  metadata?: any
): Promise<{ success: boolean; data?: WhatsAppMessage; error?: any }> => {
  try {
    // Formater le numéro de téléphone
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Vérifier que le numéro est valide
    if (!isValidPhoneNumber(formattedNumber)) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide'
      };
    }
    
    // Dans une application réelle, vous feriez un appel à l'API WhatsApp Business ici
    // Pour cet exemple, nous simulons l'envoi
    
    // Enregistrer le message dans la base de données
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        recipient: formattedNumber,
        message,
        status: 'sent', // Simuler un envoi réussi
        metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Ouvrir WhatsApp dans le navigateur
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
};

/**
 * Envoie un message WhatsApp à partir d'un modèle
 * 
 * @param phoneNumber - Le numéro de téléphone du destinataire
 * @param templateName - Le nom du modèle
 * @param variables - Les variables à remplacer dans le modèle
 * @param metadata - Les métadonnées du message
 * @returns Le message envoyé
 */
export const sendWhatsAppTemplateMessage = async (
  phoneNumber: string,
  templateName: string,
  variables: Record<string, string>,
  metadata?: any
): Promise<{ success: boolean; data?: WhatsAppMessage; error?: any }> => {
  try {
    // Récupérer le modèle
    const { data: template, error: templateError } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('name', templateName)
      .single();
    
    if (templateError) throw templateError;
    
    // Remplacer les variables dans le modèle
    let message = template.content;
    
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    // Envoyer le message
    return sendWhatsAppMessage(phoneNumber, message, {
      ...metadata,
      template_id: template.id,
      template_name: templateName,
      variables
    });
  } catch (error) {
    console.error('Error sending WhatsApp template message:', error);
    return { success: false, error };
  }
};

/**
 * Crée un nouveau modèle WhatsApp
 * 
 * @param name - Le nom du modèle
 * @param content - Le contenu du modèle
 * @returns Le modèle créé
 */
export const createWhatsAppTemplate = async (
  name: string,
  content: string
): Promise<{ success: boolean; data?: WhatsAppTemplate; error?: any }> => {
  try {
    // Extraire les variables du contenu
    const variableRegex = /{{([^}]+)}}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }
    
    // Créer le modèle
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert({
        name,
        content,
        variables
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating WhatsApp template:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les modèles WhatsApp
 * 
 * @returns Les modèles WhatsApp
 */
export const getWhatsAppTemplates = async (): Promise<{ success: boolean; data?: WhatsAppTemplate[]; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching WhatsApp templates:', error);
    return { success: false, error };
  }
};

/**
 * Ajoute un contact WhatsApp
 * 
 * @param userId - L'ID de l'utilisateur
 * @param phoneNumber - Le numéro de téléphone
 * @param name - Le nom du contact
 * @returns Le contact créé
 */
export const addWhatsAppContact = async (
  userId: string,
  phoneNumber: string,
  name: string
): Promise<{ success: boolean; data?: WhatsAppContact; error?: any }> => {
  try {
    // Formater le numéro de téléphone
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Vérifier que le numéro est valide
    if (!isValidPhoneNumber(formattedNumber)) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide'
      };
    }
    
    // Créer le contact
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .insert({
        user_id: userId,
        phone_number: formattedNumber,
        name,
        is_verified: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding WhatsApp contact:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les contacts WhatsApp d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Les contacts WhatsApp
 */
export const getUserWhatsAppContacts = async (
  userId: string
): Promise<{ success: boolean; data?: WhatsAppContact[]; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user WhatsApp contacts:', error);
    return { success: false, error };
  }
};

/**
 * Vérifie un contact WhatsApp
 * 
 * @param contactId - L'ID du contact
 * @returns Le contact vérifié
 */
export const verifyWhatsAppContact = async (
  contactId: string
): Promise<{ success: boolean; data?: WhatsAppContact; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .update({ is_verified: true })
      .eq('id', contactId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error verifying WhatsApp contact:', error);
    return { success: false, error };
  }
};

/**
 * Supprime un contact WhatsApp
 * 
 * @param contactId - L'ID du contact
 * @returns Succès ou échec
 */
export const deleteWhatsAppContact = async (
  contactId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('whatsapp_contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting WhatsApp contact:', error);
    return { success: false, error };
  }
};

/**
 * Envoie un message WhatsApp à tous les membres d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @param message - Le message à envoyer
 * @returns Les messages envoyés
 */
export const sendWhatsAppMessageToGroup = async (
  groupId: number,
  message: string
): Promise<{ success: boolean; data?: { sent: number; failed: number }; error?: any }> => {
  try {
    // Récupérer les membres du groupe
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        profiles!inner(phone_number, full_name)
      `)
      .eq('group_id', groupId)
      .eq('status', 'active');
    
    if (membersError) throw membersError;
    
    // Récupérer les informations du groupe
    const { data: group, error: groupError } = await supabase
      .from('tontine_groups')
      .select('name')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    // Envoyer le message à chaque membre
    let sent = 0;
    let failed = 0;
    
    for (const member of members) {
      if (!member.profiles.phone_number) {
        failed++;
        continue;
      }
      
      const result = await sendWhatsAppMessage(
        member.profiles.phone_number,
        message,
        {
          group_id: groupId,
          group_name: group.name,
          user_id: member.user_id,
          user_name: member.profiles.full_name
        }
      );
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
    
    return {
      success: true,
      data: { sent, failed }
    };
  } catch (error) {
    console.error('Error sending WhatsApp message to group:', error);
    return { success: false, error };
  }
};

/**
 * Partage un groupe via WhatsApp
 * 
 * @param groupId - L'ID du groupe
 * @param inviteLink - Le lien d'invitation
 * @param customMessage - Un message personnalisé
 * @returns Succès ou échec
 */
export const shareGroupViaWhatsApp = async (
  groupId: number,
  inviteLink: string,
  customMessage?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Récupérer les informations du groupe
    const { data: group, error } = await supabase
      .from('tontine_groups')
      .select('name, contribution_amount, frequency')
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    
    // Construire le message
    const message = customMessage || 
      `Rejoins notre groupe de tontine "${group.name}" sur Naat ! 🌟\n\n` +
      `💰 Contribution: ${group.contribution_amount}\n` +
      `🔄 Fréquence: ${group.frequency}\n\n` +
      `Clique sur ce lien pour rejoindre: ${inviteLink}`;
    
    // Ouvrir WhatsApp avec le message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    return { success: true };
  } catch (error) {
    console.error('Error sharing group via WhatsApp:', error);
    return { success: false, error };
  }
};

/**
 * Envoie un rappel de paiement via WhatsApp
 * 
 * @param userId - L'ID de l'utilisateur
 * @param groupId - L'ID du groupe
 * @param amount - Le montant dû
 * @param dueDate - La date d'échéance
 * @returns Le message envoyé
 */
export const sendPaymentReminderViaWhatsApp = async (
  userId: string,
  groupId: number,
  amount: number,
  dueDate: string
): Promise<{ success: boolean; data?: WhatsAppMessage; error?: any }> => {
  try {
    // Récupérer les informations de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('phone_number, full_name')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    if (!user.phone_number) {
      return {
        success: false,
        error: 'L\'utilisateur n\'a pas de numéro de téléphone'
      };
    }
    
    // Récupérer les informations du groupe
    const { data: group, error: groupError } = await supabase
      .from('tontine_groups')
      .select('name')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    // Construire le message
    const message = 
      `Bonjour ${user.full_name},\n\n` +
      `Ceci est un rappel pour votre paiement de ${amount} pour le groupe "${group.name}".\n` +
      `Date d'échéance: ${new Date(dueDate).toLocaleDateString()}\n\n` +
      `Merci de régler votre contribution à temps.`;
    
    // Envoyer le message
    return sendWhatsAppMessage(
      user.phone_number,
      message,
      {
        type: 'payment_reminder',
        group_id: groupId,
        group_name: group.name,
        amount,
        due_date: dueDate
      }
    );
  } catch (error) {
    console.error('Error sending payment reminder via WhatsApp:', error);
    return { success: false, error };
  }
};

// Fonctions utilitaires

/**
 * Formate un numéro de téléphone
 * 
 * @param phoneNumber - Le numéro de téléphone à formater
 * @returns Le numéro formaté
 */
const formatPhoneNumber = (phoneNumber: string): string => {
  // Supprimer tous les caractères non numériques
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Ajouter le préfixe international si nécessaire
  if (!cleaned.startsWith('00') && !cleaned.startsWith('+')) {
    // Par défaut, ajouter le préfixe français
    cleaned = '33' + (cleaned.startsWith('0') ? cleaned.substring(1) : cleaned);
  } else if (cleaned.startsWith('00')) {
    // Remplacer 00 par rien (le + sera ajouté plus tard)
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('+')) {
    // Supprimer le +
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
};

/**
 * Vérifie si un numéro de téléphone est valide
 * 
 * @param phoneNumber - Le numéro de téléphone à vérifier
 * @returns true si le numéro est valide, false sinon
 */
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Vérification simple : au moins 10 chiffres
  return phoneNumber.length >= 10;
};
