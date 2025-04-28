-- Migration pour ajouter les tables de recommandations à Supabase

-- Table des recommandations de services
CREATE TABLE IF NOT EXISTS service_recommendations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL, -- Score de recommandation (0-100)
  reason VARCHAR(50) NOT NULL, -- 'history', 'similar_users', 'popular', 'bundle'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Table des interactions avec les services
CREATE TABLE IF NOT EXISTS service_interactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'subscribe', 'cancel'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour enregistrer une interaction avec un service
CREATE OR REPLACE FUNCTION record_service_interaction(
  p_user_id UUID,
  p_service_id INTEGER,
  p_interaction_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO service_interactions (
    user_id,
    service_id,
    interaction_type
  )
  VALUES (
    p_user_id,
    p_service_id,
    p_interaction_type
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des recommandations pour un utilisateur
CREATE OR REPLACE FUNCTION generate_service_recommendations(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_service RECORD;
  v_score DECIMAL(5, 2);
  v_reason VARCHAR(50);
  v_count INTEGER;
BEGIN
  -- Supprimer les recommandations existantes
  DELETE FROM service_recommendations
  WHERE user_id = p_user_id;
  
  -- 1. Recommandations basées sur l'historique de l'utilisateur
  FOR v_service IN (
    SELECT 
      s.id,
      COUNT(si.id) AS interaction_count
    FROM services s
    JOIN service_interactions si ON s.id = si.service_id
    WHERE si.user_id = p_user_id
    GROUP BY s.id
    ORDER BY interaction_count DESC
    LIMIT 5
  )
  LOOP
    -- Calculer un score basé sur le nombre d'interactions
    v_score := LEAST(100, v_service.interaction_count * 10);
    
    -- Insérer la recommandation
    INSERT INTO service_recommendations (
      user_id,
      service_id,
      score,
      reason
    )
    VALUES (
      p_user_id,
      v_service.id,
      v_score,
      'history'
    )
    ON CONFLICT (user_id, service_id) 
    DO UPDATE SET 
      score = v_score,
      reason = 'history',
      updated_at = NOW();
  END LOOP;
  
  -- 2. Recommandations basées sur les services populaires
  FOR v_service IN (
    SELECT 
      s.id,
      COUNT(ss.id) AS subscription_count
    FROM services s
    JOIN service_subscriptions ss ON s.id = ss.service_id
    WHERE ss.status = 'active'
    GROUP BY s.id
    ORDER BY subscription_count DESC
    LIMIT 5
  )
  LOOP
    -- Vérifier si l'utilisateur est déjà abonné à ce service
    SELECT COUNT(*) INTO v_count
    FROM service_subscriptions
    WHERE user_id = p_user_id AND service_id = v_service.id AND status = 'active';
    
    -- Ne pas recommander les services auxquels l'utilisateur est déjà abonné
    IF v_count = 0 THEN
      -- Calculer un score basé sur la popularité
      v_score := LEAST(90, v_service.subscription_count * 5);
      
      -- Insérer la recommandation
      INSERT INTO service_recommendations (
        user_id,
        service_id,
        score,
        reason
      )
      VALUES (
        p_user_id,
        v_service.id,
        v_score,
        'popular'
      )
      ON CONFLICT (user_id, service_id) 
      DO UPDATE SET 
        score = GREATEST(service_recommendations.score, v_score),
        reason = CASE WHEN service_recommendations.score < v_score THEN 'popular' ELSE service_recommendations.reason END,
        updated_at = NOW();
    END IF;
  END LOOP;
  
  -- 3. Recommandations basées sur les utilisateurs similaires
  FOR v_service IN (
    WITH user_services AS (
      SELECT service_id
      FROM service_subscriptions
      WHERE user_id = p_user_id AND status = 'active'
    ),
    similar_users AS (
      SELECT 
        ss.user_id,
        COUNT(*) AS common_services
      FROM service_subscriptions ss
      JOIN user_services us ON ss.service_id = us.service_id
      WHERE ss.status = 'active' AND ss.user_id != p_user_id
      GROUP BY ss.user_id
      HAVING COUNT(*) > 0
      ORDER BY common_services DESC
      LIMIT 10
    ),
    recommended_services AS (
      SELECT 
        ss.service_id,
        COUNT(*) AS recommendation_count
      FROM service_subscriptions ss
      JOIN similar_users su ON ss.user_id = su.user_id
      WHERE ss.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM user_services us WHERE us.service_id = ss.service_id
      )
      GROUP BY ss.service_id
      ORDER BY recommendation_count DESC
      LIMIT 5
    )
    SELECT 
      rs.service_id AS id,
      rs.recommendation_count
    FROM recommended_services rs
  )
  LOOP
    -- Calculer un score basé sur les recommandations des utilisateurs similaires
    v_score := LEAST(95, v_service.recommendation_count * 15);
    
    -- Insérer la recommandation
    INSERT INTO service_recommendations (
      user_id,
      service_id,
      score,
      reason
    )
    VALUES (
      p_user_id,
      v_service.id,
      v_score,
      'similar_users'
    )
    ON CONFLICT (user_id, service_id) 
    DO UPDATE SET 
      score = GREATEST(service_recommendations.score, v_score),
      reason = CASE WHEN service_recommendations.score < v_score THEN 'similar_users' ELSE service_recommendations.reason END,
      updated_at = NOW();
  END LOOP;
  
  -- 4. Recommandations basées sur les offres groupées
  FOR v_service IN (
    SELECT 
      sb.service_id,
      sb.discount_percentage
    FROM service_bundles sb
    JOIN service_bundle_items sbi ON sb.id = sbi.bundle_id
    JOIN service_subscriptions ss ON sbi.service_id = ss.service_id
    WHERE ss.user_id = p_user_id AND ss.status = 'active'
    AND NOT EXISTS (
      SELECT 1 
      FROM service_subscriptions ss2 
      WHERE ss2.user_id = p_user_id AND ss2.service_id = sb.service_id AND ss2.status = 'active'
    )
    GROUP BY sb.service_id, sb.discount_percentage
    ORDER BY sb.discount_percentage DESC
    LIMIT 5
  )
  LOOP
    -- Calculer un score basé sur la remise de l'offre groupée
    v_score := LEAST(98, v_service.discount_percentage * 2);
    
    -- Insérer la recommandation
    INSERT INTO service_recommendations (
      user_id,
      service_id,
      score,
      reason
    )
    VALUES (
      p_user_id,
      v_service.id,
      v_score,
      'bundle'
    )
    ON CONFLICT (user_id, service_id) 
    DO UPDATE SET 
      score = GREATEST(service_recommendations.score, v_score),
      reason = CASE WHEN service_recommendations.score < v_score THEN 'bundle' ELSE service_recommendations.reason END,
      updated_at = NOW();
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les recommandations d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_service_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  service_id INTEGER,
  service_name VARCHAR(255),
  service_description TEXT,
  service_icon VARCHAR(255),
  service_price DECIMAL(10, 2),
  service_currency VARCHAR(3),
  service_is_recurring BOOLEAN,
  service_recurring_interval VARCHAR(20),
  recommendation_score DECIMAL(5, 2),
  recommendation_reason VARCHAR(50)
) AS $$
BEGIN
  -- Générer des recommandations si nécessaire
  PERFORM generate_service_recommendations(p_user_id);
  
  -- Retourner les recommandations
  RETURN QUERY
  SELECT 
    s.id AS service_id,
    s.name AS service_name,
    s.description AS service_description,
    s.icon AS service_icon,
    s.price AS service_price,
    s.currency AS service_currency,
    s.is_recurring AS service_is_recurring,
    s.recurring_interval AS service_recurring_interval,
    sr.score AS recommendation_score,
    sr.reason AS recommendation_reason
  FROM service_recommendations sr
  JOIN services s ON sr.service_id = s.id
  WHERE sr.user_id = p_user_id
  AND s.is_active = TRUE
  AND NOT EXISTS (
    SELECT 1 
    FROM service_subscriptions ss 
    WHERE ss.user_id = p_user_id AND ss.service_id = s.id AND ss.status = 'active'
  )
  ORDER BY sr.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Création des politiques de sécurité RLS
ALTER TABLE service_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_interactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour service_recommendations
CREATE POLICY "Users can view their own recommendations" 
ON service_recommendations FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can insert recommendations" 
ON service_recommendations FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can update recommendations" 
ON service_recommendations FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour service_interactions
CREATE POLICY "Users can view their own interactions" 
ON service_interactions FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Users can insert their own interactions" 
ON service_interactions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Création de la table pour les offres groupées
CREATE TABLE IF NOT EXISTS service_bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE, -- Service principal
  discount_percentage INTEGER NOT NULL, -- Pourcentage de remise
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services inclus dans les offres groupées
CREATE TABLE IF NOT EXISTS service_bundle_items (
  id SERIAL PRIMARY KEY,
  bundle_id INTEGER NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bundle_id, service_id)
);

-- Création des politiques de sécurité RLS pour les offres groupées
ALTER TABLE service_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bundle_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour service_bundles
CREATE POLICY "Service bundles are viewable by everyone" 
ON service_bundles FOR SELECT USING (true);

CREATE POLICY "Service bundles are insertable by admins only" 
ON service_bundles FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Service bundles are updatable by admins only" 
ON service_bundles FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour service_bundle_items
CREATE POLICY "Service bundle items are viewable by everyone" 
ON service_bundle_items FOR SELECT USING (true);

CREATE POLICY "Service bundle items are insertable by admins only" 
ON service_bundle_items FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Service bundle items are updatable by admins only" 
ON service_bundle_items FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Insertion d'offres groupées de test
INSERT INTO service_bundles (name, description, service_id, discount_percentage, is_active)
VALUES 
  ('Pack Premium + Assurance', 'Abonnez-vous à Premium et bénéficiez d''une remise sur l''Assurance Tontine', 1, 20, TRUE),
  ('Pack Analyse Complète', 'Analyse Financière avec Consultation Financière à prix réduit', 3, 15, TRUE),
  ('Pack International', 'Transfert International avec Analyse Financière', 4, 10, TRUE);

-- Insertion des services inclus dans les offres groupées
INSERT INTO service_bundle_items (bundle_id, service_id)
VALUES 
  (1, 2), -- Pack Premium + Assurance: Assurance Tontine
  (2, 5), -- Pack Analyse Complète: Consultation Financière
  (3, 3); -- Pack International: Analyse Financière
