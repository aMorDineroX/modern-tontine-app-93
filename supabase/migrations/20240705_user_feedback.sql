-- Migration pour ajouter la table de feedback utilisateur à Supabase

-- Table des feedbacks utilisateurs
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id VARCHAR(50) NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  usability VARCHAR(20),
  feedback TEXT,
  email VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_feedback_feature_id ON user_feedback(feature_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les feedbacks
-- Les administrateurs peuvent voir tous les feedbacks
CREATE POLICY "Admins can view all feedback" 
ON user_feedback FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Les utilisateurs peuvent voir leurs propres feedbacks
CREATE POLICY "Users can view their own feedback" 
ON user_feedback FOR SELECT 
USING (auth.uid() = user_id);

-- Tout le monde peut insérer des feedbacks
CREATE POLICY "Anyone can insert feedback" 
ON user_feedback FOR INSERT 
WITH CHECK (true);

-- Fonction pour obtenir des statistiques sur les feedbacks
CREATE OR REPLACE FUNCTION get_feature_feedback_stats(
  p_feature_id VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'feature_id', p_feature_id,
    'average_rating', AVG(rating),
    'total_feedback', COUNT(*),
    'rating_distribution', json_build_object(
      '1', COUNT(*) FILTER (WHERE rating = 1),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '5', COUNT(*) FILTER (WHERE rating = 5)
    ),
    'usability_distribution', json_build_object(
      'very_easy', COUNT(*) FILTER (WHERE usability = 'very_easy'),
      'easy', COUNT(*) FILTER (WHERE usability = 'easy'),
      'neutral', COUNT(*) FILTER (WHERE usability = 'neutral'),
      'difficult', COUNT(*) FILTER (WHERE usability = 'difficult'),
      'very_difficult', COUNT(*) FILTER (WHERE usability = 'very_difficult')
    )
  ) INTO v_result
  FROM user_feedback
  WHERE feature_id = p_feature_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE user_feedback IS 'Stocke les feedbacks des utilisateurs sur les fonctionnalités';
COMMENT ON COLUMN user_feedback.id IS 'Identifiant unique du feedback';
COMMENT ON COLUMN user_feedback.feature_id IS 'Identifiant de la fonctionnalité évaluée';
COMMENT ON COLUMN user_feedback.feature_name IS 'Nom de la fonctionnalité évaluée';
COMMENT ON COLUMN user_feedback.rating IS 'Note attribuée à la fonctionnalité (1-5)';
COMMENT ON COLUMN user_feedback.usability IS 'Évaluation de la facilité d''utilisation';
COMMENT ON COLUMN user_feedback.feedback IS 'Commentaires textuels de l''utilisateur';
COMMENT ON COLUMN user_feedback.email IS 'Email de l''utilisateur (si consentement)';
COMMENT ON COLUMN user_feedback.user_id IS 'Identifiant de l''utilisateur (si connecté)';
COMMENT ON COLUMN user_feedback.contact_consent IS 'Consentement pour être contacté';
COMMENT ON COLUMN user_feedback.created_at IS 'Date et heure de création du feedback';
