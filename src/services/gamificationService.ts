import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserLevel {
  level: number;
  points: number;
  next_level_points: number;
  progress_percentage: number;
}

/**
 * Récupère les réalisations d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des réalisations
 */
export const getUserAchievements = async (userId: string): Promise<ServiceResponse<UserAchievement[]>> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return { success: false, error };
  }
};

/**
 * Récupère le niveau d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Niveau de l'utilisateur
 */
export const getUserLevel = async (userId: string): Promise<ServiceResponse<UserLevel>> => {
  try {
    // Simuler un appel à une fonction RPC
    // Dans une implémentation réelle, vous utiliseriez une fonction RPC Supabase
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();
      
    if (pointsError) throw pointsError;
    
    const points = userPoints?.points || 0;
    
    // Calculer le niveau en fonction des points
    // Formule simple : niveau = racine carrée(points / 100)
    const level = Math.floor(Math.sqrt(points / 100)) + 1;
    
    // Points nécessaires pour le niveau suivant
    const nextLevelPoints = Math.pow(level, 2) * 100;
    
    // Pourcentage de progression vers le niveau suivant
    const prevLevelPoints = Math.pow(level - 1, 2) * 100;
    const progress = ((points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;
    
    const userLevel: UserLevel = {
      level,
      points,
      next_level_points: nextLevelPoints,
      progress_percentage: Math.min(Math.max(progress, 0), 100)
    };
    
    return { success: true, data: userLevel };
  } catch (error) {
    console.error('Error fetching user level:', error);
    return { success: false, error };
  }
};

/**
 * Attribue des points à un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param points - Le nombre de points à attribuer
 * @param reason - La raison de l'attribution des points
 * @returns Le nouveau total de points
 */
export const awardPoints = async (userId: string, points: number, reason: string): Promise<ServiceResponse<number>> => {
  try {
    // Vérifier si l'utilisateur a déjà des points
    const { data: existingPoints, error: checkError } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      throw checkError;
    }
    
    let newPoints;
    
    if (existingPoints) {
      // Mettre à jour les points existants
      const { data, error } = await supabase
        .from('user_points')
        .update({ 
          points: existingPoints.points + points,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('points')
        .single();
        
      if (error) throw error;
      newPoints = data.points;
    } else {
      // Créer un nouvel enregistrement de points
      const { data, error } = await supabase
        .from('user_points')
        .insert({ 
          user_id: userId, 
          points: points,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('points')
        .single();
        
      if (error) throw error;
      newPoints = data.points;
    }
    
    // Enregistrer l'historique des points
    await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points: points,
        reason: reason,
        created_at: new Date().toISOString()
      });
    
    return { success: true, data: newPoints };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error };
  }
};

/**
 * Vérifie et attribue des réalisations à un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Liste des nouvelles réalisations attribuées
 */
export const checkAndAwardAchievements = async (userId: string): Promise<ServiceResponse<Achievement[]>> => {
  try {
    // Récupérer les réalisations déjà obtenues par l'utilisateur
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
      
    if (userAchievementsError) throw userAchievementsError;
    
    const achievedIds = userAchievements?.map(ua => ua.achievement_id) || [];
    
    // Récupérer toutes les réalisations disponibles
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');
      
    if (achievementsError) throw achievementsError;
    
    // Filtrer les réalisations non obtenues
    const unachievedAchievements = allAchievements?.filter(a => !achievedIds.includes(a.id)) || [];
    
    // Vérifier les conditions pour chaque réalisation
    // Ceci est une simulation - dans une implémentation réelle, vous vérifieriez des conditions spécifiques
    const newlyAchieved: Achievement[] = [];
    
    for (const achievement of unachievedAchievements) {
      // Simuler une vérification de condition
      const conditionMet = Math.random() > 0.7; // 30% de chance d'obtenir une réalisation
      
      if (conditionMet) {
        // Attribuer la réalisation
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            achieved_at: new Date().toISOString()
          });
          
        // Attribuer des points pour la réalisation
        await awardPoints(userId, achievement.points, `Réalisation débloquée: ${achievement.name}`);
        
        newlyAchieved.push(achievement);
      }
    }
    
    return { success: true, data: newlyAchieved };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { success: false, error };
  }
};
