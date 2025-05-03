
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zctvkxwnrhxdiuzuptof.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8';

// Create Supabase client with custom options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    // Enable realtime subscriptions
    enabled: true
  }
});

// Define database types based on our schema
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type Profile = {
  id: string; // UUID référençant auth.users
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type TontineGroup = {
  id: string | number;
  name: string;
  contribution_amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
  payout_method: 'rotation' | 'random' | 'bidding';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
};

export type Contribution = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'missed';
  payment_date: string;
  created_at: string;
  updated_at: string;
};

export type Payout = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  amount: number;
  payout_date: string;
  status: 'scheduled' | 'paid' | 'pending';
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  duration?: number; // en jours
  features?: Record<string, any>; // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserService = {
  id: string | number;
  user_id: string;
  service_id: string | number;
  start_date: string;
  end_date: string;
  status: string; // 'active', 'cancelled', 'expired', etc.
  payment_id?: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string | number;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type?: string; // 'info', 'success', 'warning', 'error', etc.
  link?: string;
  created_at: string;
};

export type UserPoints = {
  id: string | number;
  user_id: string;
  points: number;
  total_earned: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string | number;
  name: string;
  description: string;
  points: number;
  icon?: string;
  created_at: string;
};

export type UserAchievement = {
  id: string | number;
  user_id: string;
  achievement_id: string | number;
  unlocked_at: string;
};

export type PromoCode = {
  id: string | number;
  code: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_to: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
};

export type UserRole = {
  id: string | number;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
};

// Utility functions for Supabase operations

// ===== Fonctions pour les groupes =====

/**
 * Crée un nouveau groupe de tontine
 */
export const createGroup = async (groupData: Omit<TontineGroup, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // Utiliser la fonction RPC pour créer un groupe et ajouter le créateur comme admin
    const { data, error } = await supabase.rpc('create_group_with_admin', {
      p_name: groupData.name,
      p_contribution_amount: groupData.contribution_amount,
      p_frequency: groupData.frequency,
      p_start_date: groupData.start_date,
      p_payout_method: groupData.payout_method
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating group:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les détails d'un groupe
 */
export const fetchGroupDetails = async (groupId: string | number) => {
  try {
    // Récupérer les détails du groupe
    const { data, error } = await supabase
      .from('tontine_groups')
      .select('*, created_by:profiles!created_by(full_name, avatar_url)')
      .eq('id', groupId)
      .single();

    if (error) throw error;

    // Récupérer les statistiques du groupe
    const { data: stats, error: statsError } = await supabase
      .rpc('get_group_stats', { p_group_id: groupId });

    if (statsError) throw statsError;

    return {
      data: {
        ...data,
        stats
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching group details:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour un groupe de tontine
 */
export const updateGroup = async (groupId: string | number, groupData: Partial<TontineGroup>) => {
  try {
    const { data, error } = await supabase
      .from('tontine_groups')
      .update({
        ...groupData,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating group:', error);
    return { data: null, error };
  }
};

/**
 * Supprime un groupe de tontine
 */
export const deleteGroup = async (groupId: string | number) => {
  try {
    const { error } = await supabase
      .from('tontine_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error };
  }
};

// ===== Fonctions pour les membres =====

/**
 * Ajoute un membre à un groupe
 */
export const addGroupMember = async (
  groupId: string | number,
  userId: string,
  role: 'admin' | 'member' = 'member',
  status: 'active' | 'pending' | 'inactive' = 'pending'
) => {
  try {
    // Utiliser la fonction RPC pour ajouter un membre
    const { data, error } = await supabase.rpc('add_group_member', {
      p_group_id: groupId,
      p_user_id: userId,
      p_role: role,
      p_status: status
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding group member:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les membres d'un groupe avec leurs statistiques
 */
export const fetchGroupMembers = async (groupId: string | number) => {
  try {
    // Utiliser la fonction RPC pour récupérer les membres avec leurs statistiques
    const { data, error } = await supabase
      .rpc('get_group_members_with_stats', { p_group_id: groupId });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching group members:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour le statut ou le rôle d'un membre
 */
export const updateGroupMember = async (
  groupId: string | number,
  userId: string,
  updates: { role?: 'admin' | 'member', status?: 'active' | 'pending' | 'inactive' }
) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .match({ group_id: groupId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating group member:', error);
    return { data: null, error };
  }
};

/**
 * Supprime un membre d'un groupe
 */
export const removeGroupMember = async (groupId: string | number, userId: string) => {
  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .match({ group_id: groupId, user_id: userId });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing group member:', error);
    return { success: false, error };
  }
};

// ===== Fonctions pour les utilisateurs =====

/**
 * Récupère les groupes d'un utilisateur
 */
export const fetchUserGroups = async (userId: string) => {
  try {
    // Utiliser la fonction RPC pour récupérer les groupes avec leurs statistiques
    const { data, error } = await supabase
      .rpc('get_user_groups_with_stats', { p_user_id: userId });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les statistiques d'un utilisateur
 */
export const fetchUserStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_stats', { p_user_id: userId });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour le profil d'un utilisateur
 */
export const updateUserProfile = async (userId: string, profileData: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les contributions =====

/**
 * Crée une nouvelle contribution
 */
export const createContribution = async (
  groupId: string | number,
  amount: number,
  status: 'pending' | 'paid' | 'missed' = 'pending',
  paymentDate: string = new Date().toISOString()
) => {
  try {
    // Utiliser la fonction RPC pour créer une contribution
    const { data, error } = await supabase.rpc('create_contribution', {
      p_group_id: groupId,
      p_amount: amount,
      p_status: status,
      p_payment_date: paymentDate
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating contribution:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les contributions d'un groupe
 */
export const fetchGroupContributions = async (groupId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching group contributions:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour le statut d'une contribution
 */
export const updateContributionStatus = async (
  contributionId: string | number,
  status: 'pending' | 'paid' | 'missed'
) => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating contribution status:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les paiements =====

/**
 * Crée un nouveau paiement
 */
export const createPayout = async (
  groupId: string | number,
  userId: string,
  amount: number,
  status: 'scheduled' | 'paid' | 'pending' = 'scheduled',
  payoutDate: string = new Date().toISOString()
) => {
  try {
    // Utiliser la fonction RPC pour créer un paiement
    const { data, error } = await supabase.rpc('create_payout', {
      p_group_id: groupId,
      p_user_id: userId,
      p_amount: amount,
      p_status: status,
      p_payout_date: payoutDate
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating payout:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les paiements d'un groupe
 */
export const fetchGroupPayouts = async (groupId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('payout_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching group payouts:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour le statut d'un paiement
 */
export const updatePayoutStatus = async (
  payoutId: string | number,
  status: 'scheduled' | 'paid' | 'pending'
) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', payoutId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating payout status:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les services =====

/**
 * Récupère tous les services actifs
 */
export const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { data: null, error };
  }
};

/**
 * Souscrit à un service
 */
export const subscribeToService = async (
  serviceId: string | number,
  startDate: string = new Date().toISOString(),
  endDate: string,
  paymentId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('user_services')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        service_id: serviceId,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        payment_id: paymentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error subscribing to service:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les messages =====

/**
 * Envoie un message dans un groupe
 */
export const sendMessage = async (groupId: string | number, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les messages d'un groupe
 */
export const fetchGroupMessages = async (groupId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les notifications =====

/**
 * Récupère les notifications d'un utilisateur
 */
export const fetchUserNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { data: null, error };
  }
};

/**
 * Marque une notification comme lue
 */
export const markNotificationAsRead = async (notificationId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { data: null, error };
  }
};

// ===== Fonctions pour les paiements =====

/**
 * Traite un paiement (dépôt ou retrait)
 */
export const processPayment = async (amount: number, type: 'deposit' | 'withdraw') => {
  try {
    // Cette fonction simule un traitement de paiement
    // Dans une application réelle, cela impliquerait l'intégration avec un système de paiement

    // Pour l'exemple, retournons simplement une réponse réussie après un délai simulé
    await new Promise(resolve => setTimeout(resolve, 1000));

    // On pourrait enregistrer la transaction dans une table transactions
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error processing ${type}:`, error);
    return { success: false, error };
  }
};

// ===== Fonctions pour la recherche =====

/**
 * Recherche des groupes
 */
export const searchGroups = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase
      .rpc('search_groups', { p_search_term: searchTerm });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching groups:', error);
    return { data: null, error };
  }
};

/**
 * Recherche des utilisateurs
 */
export const searchUsers = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase
      .rpc('search_users', { p_search_term: searchTerm });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching users:', error);
    return { data: null, error };
  }
};
