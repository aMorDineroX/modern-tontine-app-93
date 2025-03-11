
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define database types based on our schema
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
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
};

export type GroupMember = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  created_at: string;
};

export type Contribution = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'missed';
  payment_date: string;
  created_at: string;
};

export type Payout = {
  id: string | number;
  group_id: string | number;
  user_id: string;
  amount: number;
  payout_date: string;
  status: 'scheduled' | 'paid' | 'pending';
  created_at: string;
};

// Utility functions for Supabase operations
export const createGroup = async (groupData: Omit<TontineGroup, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('tontine_groups')
      .insert(groupData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating group:', error);
    return { data: null, error };
  }
};

export const addGroupMember = async (memberData: Omit<GroupMember, 'id' | 'created_at' | 'joined_at'>) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        ...memberData,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding group member:', error);
    return { data: null, error };
  }
};

export const fetchUserGroups = async (userId: string) => {
  try {
    // Fetch groups the user has created
    const { data: createdGroups, error: createdError } = await supabase
      .from('tontine_groups')
      .select('*')
      .eq('created_by', userId);
    
    if (createdError) throw createdError;
    
    // Fetch groups the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    
    if (membershipError) throw membershipError;
    
    // If user is a member of any groups, fetch those groups
    let memberGroups = [];
    if (memberships && memberships.length > 0) {
      const groupIds = memberships.map(m => m.group_id);
      
      const { data: groups, error: groupsError } = await supabase
        .from('tontine_groups')
        .select('*')
        .in('id', groupIds);
      
      if (groupsError) throw groupsError;
      memberGroups = groups || [];
    }
    
    // Combine created groups and member groups, remove duplicates
    const allGroups = [...(createdGroups || []), ...memberGroups];
    const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());
    
    return { data: uniqueGroups, error: null };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return { data: null, error };
  }
};

// Nouvelles fonctions pour la gestion des contributions
export const createContribution = async (contributionData: Omit<Contribution, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .insert(contributionData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating contribution:', error);
    return { data: null, error };
  }
};

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

export const updateContributionStatus = async (
  contributionId: string | number, 
  status: 'pending' | 'paid' | 'missed'
) => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .update({ status })
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

// Fonctions pour la gestion des paiements
export const createPayout = async (payoutData: Omit<Payout, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating payout:', error);
    return { data: null, error };
  }
};

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

export const updatePayoutStatus = async (
  payoutId: string | number, 
  status: 'scheduled' | 'paid' | 'pending'
) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .update({ status })
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

// Fonction pour gérer les dépôts et retraits d'un utilisateur
export const processPayment = async (userId: string, amount: number, type: 'deposit' | 'withdraw') => {
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
