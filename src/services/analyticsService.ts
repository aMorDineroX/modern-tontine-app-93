import { supabase } from '@/utils/supabase';

// Types pour les analyses
export interface UserStatistics {
  totalContributions: number;
  totalPayouts: number;
  activeGroups: number;
  completedGroups: number;
  contributionsByMonth: { month: string; amount: number }[];
  payoutsByMonth: { month: string; amount: number }[];
  savingsRate: number; // Pourcentage des revenus épargnés
}

export interface GroupStatistics {
  id: number;
  name: string;
  totalContributions: number;
  totalPayouts: number;
  activeMembers: number;
  contributionRate: number; // Pourcentage de membres ayant contribué
  nextPayout: { userId: string; userName: string; date: string } | null;
}

export interface SystemStatistics {
  totalUsers: number;
  totalGroups: number;
  totalTransactions: number;
  activeUsers: number; // Utilisateurs actifs au cours des 30 derniers jours
  newUsers: number; // Nouveaux utilisateurs au cours des 30 derniers jours
  transactionVolume: number; // Volume total des transactions
  userGrowth: { date: string; count: number }[]; // Croissance des utilisateurs
}

/**
 * Récupère les statistiques d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Les statistiques de l'utilisateur
 */
export const getUserStatistics = async (
  userId: string
): Promise<{ success: boolean; data?: UserStatistics; error?: any }> => {
  try {
    // Récupérer les contributions de l'utilisateur
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('amount, payment_date, status')
      .eq('user_id', userId);
    
    if (contributionsError) throw contributionsError;
    
    // Récupérer les paiements reçus par l'utilisateur
    const { data: payouts, error: payoutsError } = await supabase
      .from('payouts')
      .select('amount, payment_date, status')
      .eq('user_id', userId);
    
    if (payoutsError) throw payoutsError;
    
    // Récupérer les groupes de l'utilisateur
    const { data: groups, error: groupsError } = await supabase
      .from('group_members')
      .select('group_id, status, tontine_groups!inner(name, status)')
      .eq('user_id', userId);
    
    if (groupsError) throw groupsError;
    
    // Calculer les statistiques
    const totalContributions = contributions
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalPayouts = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const activeGroups = groups
      .filter(g => g.tontine_groups.status === 'active')
      .length;
    
    const completedGroups = groups
      .filter(g => g.tontine_groups.status === 'completed')
      .length;
    
    // Calculer les contributions par mois
    const contributionsByMonth = getAmountsByMonth(contributions);
    
    // Calculer les paiements par mois
    const payoutsByMonth = getAmountsByMonth(payouts);
    
    // Calculer le taux d'épargne (estimation)
    const savingsRate = calculateSavingsRate(totalContributions, totalPayouts);
    
    const statistics: UserStatistics = {
      totalContributions,
      totalPayouts,
      activeGroups,
      completedGroups,
      contributionsByMonth,
      payoutsByMonth,
      savingsRate
    };
    
    return { success: true, data: statistics };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les statistiques d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @returns Les statistiques du groupe
 */
export const getGroupStatistics = async (
  groupId: number
): Promise<{ success: boolean; data?: GroupStatistics; error?: any }> => {
  try {
    // Récupérer les informations du groupe
    const { data: group, error: groupError } = await supabase
      .from('tontine_groups')
      .select('id, name, status')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    // Récupérer les membres du groupe
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id, status, profiles!inner(full_name)')
      .eq('group_id', groupId);
    
    if (membersError) throw membersError;
    
    // Récupérer les contributions du groupe
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('amount, user_id, status')
      .eq('group_id', groupId);
    
    if (contributionsError) throw contributionsError;
    
    // Récupérer les paiements du groupe
    const { data: payouts, error: payoutsError } = await supabase
      .from('payouts')
      .select('amount, user_id, payment_date, status')
      .eq('group_id', groupId);
    
    if (payoutsError) throw payoutsError;
    
    // Calculer les statistiques
    const totalContributions = contributions
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalPayouts = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const activeMembers = members
      .filter(m => m.status === 'active')
      .length;
    
    // Calculer le taux de contribution
    const contributionRate = calculateContributionRate(members, contributions);
    
    // Déterminer le prochain paiement
    const nextPayout = getNextPayout(payouts, members);
    
    const statistics: GroupStatistics = {
      id: group.id,
      name: group.name,
      totalContributions,
      totalPayouts,
      activeMembers,
      contributionRate,
      nextPayout
    };
    
    return { success: true, data: statistics };
  } catch (error) {
    console.error('Error fetching group statistics:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les statistiques du système (pour les administrateurs)
 * 
 * @returns Les statistiques du système
 */
export const getSystemStatistics = async (): Promise<{ success: boolean; data?: SystemStatistics; error?: any }> => {
  try {
    // Récupérer le nombre total d'utilisateurs
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Récupérer le nombre total de groupes
    const { count: totalGroups, error: groupsError } = await supabase
      .from('tontine_groups')
      .select('id', { count: 'exact', head: true });
    
    if (groupsError) throw groupsError;
    
    // Récupérer le nombre total de transactions
    const { count: totalTransactions, error: transactionsError } = await supabase
      .from('contributions')
      .select('id', { count: 'exact', head: true });
    
    if (transactionsError) throw transactionsError;
    
    // Récupérer le nombre d'utilisateurs actifs au cours des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('contributions')
      .select('user_id', { count: 'exact', head: true })
      .gt('created_at', thirtyDaysAgo.toISOString())
      .is('user_id', 'not.null');
    
    if (activeUsersError) throw activeUsersError;
    
    // Récupérer le nombre de nouveaux utilisateurs au cours des 30 derniers jours
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', thirtyDaysAgo.toISOString());
    
    if (newUsersError) throw newUsersError;
    
    // Récupérer le volume total des transactions
    const { data: transactions, error: volumeError } = await supabase
      .from('contributions')
      .select('amount')
      .eq('status', 'completed');
    
    if (volumeError) throw volumeError;
    
    const transactionVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Récupérer la croissance des utilisateurs
    const { data: userGrowthData, error: growthError } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });
    
    if (growthError) throw growthError;
    
    const userGrowth = calculateUserGrowth(userGrowthData);
    
    const statistics: SystemStatistics = {
      totalUsers: totalUsers || 0,
      totalGroups: totalGroups || 0,
      totalTransactions: totalTransactions || 0,
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      transactionVolume,
      userGrowth
    };
    
    return { success: true, data: statistics };
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    return { success: false, error };
  }
};

/**
 * Enregistre un événement d'analyse
 * 
 * @param userId - L'ID de l'utilisateur
 * @param eventType - Le type d'événement
 * @param metadata - Les métadonnées de l'événement
 * @returns Succès ou échec
 */
export const trackEvent = async (
  userId: string,
  eventType: string,
  metadata?: any
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        metadata
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error tracking event:', error);
    return { success: false, error };
  }
};

// Fonctions utilitaires

/**
 * Calcule les montants par mois
 * 
 * @param items - Les éléments à analyser
 * @returns Les montants par mois
 */
const getAmountsByMonth = (items: any[]): { month: string; amount: number }[] => {
  const monthlyAmounts: Record<string, number> = {};
  
  items.forEach(item => {
    if (item.status !== 'completed') return;
    
    const date = new Date(item.payment_date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyAmounts[month]) {
      monthlyAmounts[month] = 0;
    }
    
    monthlyAmounts[month] += item.amount;
  });
  
  return Object.entries(monthlyAmounts)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Calcule le taux d'épargne
 * 
 * @param totalContributions - Le total des contributions
 * @param totalPayouts - Le total des paiements
 * @returns Le taux d'épargne
 */
const calculateSavingsRate = (totalContributions: number, totalPayouts: number): number => {
  if (totalContributions === 0) return 0;
  
  // Estimation simple : (paiements - contributions) / contributions
  const savingsRate = (totalPayouts - totalContributions) / totalContributions * 100;
  
  return Math.max(0, savingsRate); // Éviter les taux négatifs
};

/**
 * Calcule le taux de contribution
 * 
 * @param members - Les membres du groupe
 * @param contributions - Les contributions du groupe
 * @returns Le taux de contribution
 */
const calculateContributionRate = (members: any[], contributions: any[]): number => {
  const activeMembers = members.filter(m => m.status === 'active').length;
  
  if (activeMembers === 0) return 0;
  
  // Compter les membres qui ont contribué
  const contributingMembers = new Set();
  
  contributions.forEach(contribution => {
    if (contribution.status === 'completed') {
      contributingMembers.add(contribution.user_id);
    }
  });
  
  return (contributingMembers.size / activeMembers) * 100;
};

/**
 * Détermine le prochain paiement
 * 
 * @param payouts - Les paiements du groupe
 * @param members - Les membres du groupe
 * @returns Le prochain paiement
 */
const getNextPayout = (payouts: any[], members: any[]): { userId: string; userName: string; date: string } | null => {
  // Filtrer les paiements futurs
  const futurePayout = payouts
    .filter(p => new Date(p.payment_date) > new Date() && p.status === 'pending')
    .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())[0];
  
  if (!futurePayout) return null;
  
  // Trouver le membre correspondant
  const member = members.find(m => m.user_id === futurePayout.user_id);
  
  if (!member) return null;
  
  return {
    userId: futurePayout.user_id,
    userName: member.profiles.full_name,
    date: futurePayout.payment_date
  };
};

/**
 * Calcule la croissance des utilisateurs
 * 
 * @param users - Les utilisateurs
 * @returns La croissance des utilisateurs
 */
const calculateUserGrowth = (users: any[]): { date: string; count: number }[] => {
  const usersByMonth: Record<string, number> = {};
  
  users.forEach(user => {
    const date = new Date(user.created_at);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!usersByMonth[month]) {
      usersByMonth[month] = 0;
    }
    
    usersByMonth[month]++;
  });
  
  // Convertir en tableau cumulatif
  let cumulativeCount = 0;
  
  return Object.entries(usersByMonth)
    .map(([date, count]) => {
      cumulativeCount += count;
      return { date, count: cumulativeCount };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
};
