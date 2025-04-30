-- Migration pour ajouter les tables du système de gamification à Supabase

-- Table des points des utilisateurs
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table de l'historique des points
CREATE TABLE IF NOT EXISTS points_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réalisations (achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(20) NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_achievement_category CHECK (category IN ('beginner', 'intermediate', 'advanced', 'expert'))
);

-- Table des réalisations des utilisateurs
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les utilisateurs peuvent voir leurs propres points
CREATE POLICY "Users can view their own points" 
ON user_points FOR SELECT 
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent voir leur historique de points
CREATE POLICY "Users can view their own points history" 
ON points_history FOR SELECT 
USING (auth.uid() = user_id);

-- Tout le monde peut voir les réalisations disponibles
CREATE POLICY "Anyone can view achievements" 
ON achievements FOR SELECT 
USING (true);

-- Les utilisateurs peuvent voir leurs propres réalisations
CREATE POLICY "Users can view their own achievements" 
ON user_achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Fonction pour attribuer des points à un utilisateur
CREATE OR REPLACE FUNCTION award_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_total_points INTEGER;
BEGIN
  -- Vérifier si l'utilisateur a déjà un enregistrement de points
  IF EXISTS (SELECT 1 FROM user_points WHERE user_id = p_user_id) THEN
    -- Mettre à jour les points existants
    UPDATE user_points
    SET points = points + p_points,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING points INTO v_total_points;
  ELSE
    -- Créer un nouvel enregistrement de points
    INSERT INTO user_points (user_id, points, created_at, updated_at)
    VALUES (p_user_id, p_points, NOW(), NOW())
    RETURNING points INTO v_total_points;
  END IF;
  
  -- Enregistrer l'historique des points
  INSERT INTO points_history (user_id, points, reason, created_at)
  VALUES (p_user_id, p_points, p_reason, NOW());
  
  RETURN v_total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour attribuer une réalisation à un utilisateur
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- Vérifier si l'utilisateur a déjà cette réalisation
  IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_id = p_achievement_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Attribuer la réalisation
  INSERT INTO user_achievements (user_id, achievement_id, achieved_at)
  VALUES (p_user_id, p_achievement_id, NOW());
  
  -- Récupérer les points associés à cette réalisation
  SELECT points INTO v_points FROM achievements WHERE id = p_achievement_id;
  
  -- Attribuer les points
  PERFORM award_user_points(p_user_id, v_points, 'Achievement unlocked: ' || (SELECT name FROM achievements WHERE id = p_achievement_id));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le niveau d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_level(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_points INTEGER;
  v_level INTEGER;
  v_next_level_points INTEGER;
  v_prev_level_points INTEGER;
  v_progress_percentage NUMERIC;
BEGIN
  -- Récupérer les points de l'utilisateur
  SELECT points INTO v_points FROM user_points WHERE user_id = p_user_id;
  
  -- Si l'utilisateur n'a pas de points, retourner le niveau 1
  IF v_points IS NULL THEN
    RETURN json_build_object(
      'level', 1,
      'points', 0,
      'next_level_points', 100,
      'progress_percentage', 0
    );
  END IF;
  
  -- Calculer le niveau (formule simple: niveau = racine carrée(points / 100) + 1)
  v_level := FLOOR(SQRT(v_points / 100)) + 1;
  
  -- Calculer les points nécessaires pour le niveau suivant
  v_next_level_points := POWER(v_level, 2) * 100;
  
  -- Calculer les points du niveau précédent
  v_prev_level_points := POWER(v_level - 1, 2) * 100;
  
  -- Calculer le pourcentage de progression vers le niveau suivant
  IF v_next_level_points = v_prev_level_points THEN
    v_progress_percentage := 100;
  ELSE
    v_progress_percentage := ((v_points - v_prev_level_points)::NUMERIC / (v_next_level_points - v_prev_level_points)::NUMERIC) * 100;
  END IF;
  
  -- Limiter le pourcentage entre 0 et 100
  v_progress_percentage := GREATEST(0, LEAST(100, v_progress_percentage));
  
  RETURN json_build_object(
    'level', v_level,
    'points', v_points,
    'next_level_points', v_next_level_points,
    'progress_percentage', v_progress_percentage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertion des réalisations par défaut
INSERT INTO achievements (name, description, icon, points, category)
VALUES 
  ('Premier pas', 'Créez votre premier groupe de tontine', 'star', 100, 'beginner'),
  ('Épargnant régulier', 'Effectuez 5 contributions consécutives à temps', 'medal', 200, 'beginner'),
  ('Réseau social', 'Invitez 3 amis à rejoindre un groupe', 'users', 150, 'beginner'),
  ('Explorateur', 'Visitez toutes les sections de l''application', 'compass', 100, 'beginner'),
  ('Organisateur', 'Créez 3 groupes de tontine différents', 'trophy', 300, 'intermediate'),
  ('Financier', 'Atteignez un total de 1000€ en contributions', 'dollar-sign', 400, 'intermediate'),
  ('Ponctuel', 'Effectuez 10 paiements à temps', 'clock', 250, 'intermediate'),
  ('Ambassadeur', 'Invitez 10 amis à rejoindre l''application', 'award', 500, 'advanced'),
  ('Économe', 'Atteignez un objectif d''épargne personnalisé', 'piggy-bank', 350, 'advanced'),
  ('Expert en tontine', 'Participez à 5 cycles complets de tontine', 'shield', 600, 'expert'),
  ('Philanthrope', 'Aidez un membre en difficulté', 'heart', 400, 'expert'),
  ('Maître financier', 'Atteignez un total de 5000€ en contributions', 'crown', 1000, 'expert');

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE user_points IS 'Stocke les points de gamification des utilisateurs';
COMMENT ON TABLE points_history IS 'Historique des points attribués aux utilisateurs';
COMMENT ON TABLE achievements IS 'Réalisations que les utilisateurs peuvent débloquer';
COMMENT ON TABLE user_achievements IS 'Réalisations débloquées par les utilisateurs';
