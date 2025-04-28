-- Migration pour ajouter les tables du programme de fidélité à Supabase

-- Table des comptes de fidélité des utilisateurs
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des transactions de points de fidélité
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- Positif pour les gains, négatif pour les dépenses
  transaction_type VARCHAR(50) NOT NULL, -- 'subscription', 'referral', 'reward', 'expiration', etc.
  reference_id INTEGER, -- ID de référence (service_id, reward_id, etc.)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des récompenses disponibles
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- 'discount', 'service', 'cash', etc.
  reward_value JSONB NOT NULL, -- Valeur de la récompense (pourcentage de remise, ID de service, montant, etc.)
  min_tier VARCHAR(20) DEFAULT 'bronze', -- Niveau minimum requis
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des récompenses réclamées par les utilisateurs
CREATE TABLE IF NOT EXISTS loyalty_reward_claims (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'claimed', -- 'claimed', 'used', 'expired', 'cancelled'
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour créer ou mettre à jour un compte de fidélité
CREATE OR REPLACE FUNCTION create_or_update_loyalty_account(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_account_id INTEGER;
BEGIN
  INSERT INTO loyalty_accounts (
    user_id,
    points,
    tier
  )
  VALUES (
    p_user_id,
    0,
    'bronze'
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    updated_at = NOW()
  RETURNING id INTO v_account_id;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter des points à un utilisateur
CREATE OR REPLACE FUNCTION add_loyalty_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(50),
  p_reference_id INTEGER DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_account_id INTEGER;
  v_current_points INTEGER;
  v_new_tier VARCHAR(20);
BEGIN
  -- Créer ou mettre à jour le compte de fidélité
  SELECT create_or_update_loyalty_account(p_user_id) INTO v_account_id;
  
  -- Ajouter les points
  UPDATE loyalty_accounts
  SET points = points + p_points,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING points INTO v_current_points;
  
  -- Déterminer le nouveau niveau
  IF v_current_points >= 10000 THEN
    v_new_tier := 'platinum';
  ELSIF v_current_points >= 5000 THEN
    v_new_tier := 'gold';
  ELSIF v_current_points >= 1000 THEN
    v_new_tier := 'silver';
  ELSE
    v_new_tier := 'bronze';
  END IF;
  
  -- Mettre à jour le niveau si nécessaire
  IF v_new_tier != (SELECT tier FROM loyalty_accounts WHERE user_id = p_user_id) THEN
    UPDATE loyalty_accounts
    SET tier = v_new_tier,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Enregistrer la transaction
  INSERT INTO loyalty_transactions (
    user_id,
    points,
    transaction_type,
    reference_id,
    description
  )
  VALUES (
    p_user_id,
    p_points,
    p_transaction_type,
    p_reference_id,
    p_description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour dépenser des points
CREATE OR REPLACE FUNCTION spend_loyalty_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(50),
  p_reference_id INTEGER DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_points INTEGER;
BEGIN
  -- Vérifier si l'utilisateur a suffisamment de points
  SELECT points INTO v_current_points
  FROM loyalty_accounts
  WHERE user_id = p_user_id;
  
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RETURN FALSE;
  END IF;
  
  -- Soustraire les points
  UPDATE loyalty_accounts
  SET points = points - p_points,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Enregistrer la transaction
  INSERT INTO loyalty_transactions (
    user_id,
    points,
    transaction_type,
    reference_id,
    description
  )
  VALUES (
    p_user_id,
    -p_points,
    p_transaction_type,
    p_reference_id,
    p_description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour réclamer une récompense
CREATE OR REPLACE FUNCTION claim_loyalty_reward(
  p_user_id UUID,
  p_reward_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_reward RECORD;
  v_user_tier VARCHAR(20);
  v_claim_id INTEGER;
  v_expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer les informations de la récompense
  SELECT * INTO v_reward
  FROM loyalty_rewards
  WHERE id = p_reward_id AND is_active = TRUE;
  
  IF v_reward IS NULL THEN
    RAISE EXCEPTION 'Récompense non trouvée ou inactive';
  END IF;
  
  -- Vérifier si la récompense est disponible (dates)
  IF (v_reward.start_date IS NOT NULL AND v_reward.start_date > NOW()) OR
     (v_reward.end_date IS NOT NULL AND v_reward.end_date < NOW()) THEN
    RAISE EXCEPTION 'Récompense non disponible à cette date';
  END IF;
  
  -- Récupérer le niveau de l'utilisateur
  SELECT tier INTO v_user_tier
  FROM loyalty_accounts
  WHERE user_id = p_user_id;
  
  -- Vérifier si l'utilisateur a le niveau requis
  IF v_user_tier IS NULL OR (
    CASE v_user_tier
      WHEN 'bronze' THEN 1
      WHEN 'silver' THEN 2
      WHEN 'gold' THEN 3
      WHEN 'platinum' THEN 4
      ELSE 0
    END < CASE v_reward.min_tier
      WHEN 'bronze' THEN 1
      WHEN 'silver' THEN 2
      WHEN 'gold' THEN 3
      WHEN 'platinum' THEN 4
      ELSE 0
    END
  ) THEN
    RAISE EXCEPTION 'Niveau de fidélité insuffisant';
  END IF;
  
  -- Dépenser les points
  IF NOT spend_loyalty_points(
    p_user_id,
    v_reward.points_cost,
    'reward',
    p_reward_id,
    'Réclamation de récompense: ' || v_reward.name
  ) THEN
    RAISE EXCEPTION 'Points insuffisants';
  END IF;
  
  -- Définir la date d'expiration (30 jours par défaut)
  v_expiry_date := NOW() + INTERVAL '30 days';
  
  -- Enregistrer la réclamation
  INSERT INTO loyalty_reward_claims (
    user_id,
    reward_id,
    points_spent,
    status,
    expires_at
  )
  VALUES (
    p_user_id,
    p_reward_id,
    v_reward.points_cost,
    'claimed',
    v_expiry_date
  )
  RETURNING id INTO v_claim_id;
  
  RETURN v_claim_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le compte de fidélité d'un utilisateur
CREATE OR REPLACE FUNCTION get_loyalty_account(
  p_user_id UUID
)
RETURNS TABLE (
  user_id UUID,
  points INTEGER,
  tier VARCHAR(20),
  next_tier VARCHAR(20),
  points_to_next_tier INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_account_id INTEGER;
  v_points INTEGER;
  v_tier VARCHAR(20);
  v_next_tier VARCHAR(20);
  v_points_to_next_tier INTEGER;
BEGIN
  -- Créer le compte s'il n'existe pas
  SELECT create_or_update_loyalty_account(p_user_id) INTO v_account_id;
  
  -- Récupérer les informations du compte
  SELECT 
    la.points,
    la.tier
  INTO 
    v_points,
    v_tier
  FROM loyalty_accounts la
  WHERE la.user_id = p_user_id;
  
  -- Déterminer le niveau suivant et les points nécessaires
  CASE v_tier
    WHEN 'bronze' THEN
      v_next_tier := 'silver';
      v_points_to_next_tier := 1000 - v_points;
    WHEN 'silver' THEN
      v_next_tier := 'gold';
      v_points_to_next_tier := 5000 - v_points;
    WHEN 'gold' THEN
      v_next_tier := 'platinum';
      v_points_to_next_tier := 10000 - v_points;
    WHEN 'platinum' THEN
      v_next_tier := 'platinum';
      v_points_to_next_tier := 0;
    ELSE
      v_next_tier := 'silver';
      v_points_to_next_tier := 1000 - v_points;
  END CASE;
  
  -- Retourner les résultats
  RETURN QUERY
  SELECT 
    la.user_id,
    la.points,
    la.tier,
    v_next_tier,
    v_points_to_next_tier,
    la.created_at,
    la.updated_at
  FROM loyalty_accounts la
  WHERE la.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir l'historique des transactions de points
CREATE OR REPLACE FUNCTION get_loyalty_transactions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id INTEGER,
  points INTEGER,
  transaction_type VARCHAR(50),
  reference_id INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lt.id,
    lt.points,
    lt.transaction_type,
    lt.reference_id,
    lt.description,
    lt.created_at
  FROM loyalty_transactions lt
  WHERE lt.user_id = p_user_id
  ORDER BY lt.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les récompenses disponibles pour un utilisateur
CREATE OR REPLACE FUNCTION get_available_loyalty_rewards(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(255),
  description TEXT,
  points_cost INTEGER,
  reward_type VARCHAR(50),
  reward_value JSONB,
  min_tier VARCHAR(20),
  is_available BOOLEAN,
  reason_if_unavailable TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_user_points INTEGER;
  v_user_tier VARCHAR(20);
BEGIN
  -- Récupérer les points et le niveau de l'utilisateur
  SELECT 
    la.points,
    la.tier
  INTO 
    v_user_points,
    v_user_tier
  FROM loyalty_accounts la
  WHERE la.user_id = p_user_id;
  
  -- Créer le compte s'il n'existe pas
  IF v_user_points IS NULL THEN
    PERFORM create_or_update_loyalty_account(p_user_id);
    v_user_points := 0;
    v_user_tier := 'bronze';
  END IF;
  
  -- Retourner les récompenses disponibles
  RETURN QUERY
  SELECT 
    lr.id,
    lr.name,
    lr.description,
    lr.points_cost,
    lr.reward_type,
    lr.reward_value,
    lr.min_tier,
    (
      lr.is_active AND
      (lr.start_date IS NULL OR lr.start_date <= NOW()) AND
      (lr.end_date IS NULL OR lr.end_date >= NOW()) AND
      v_user_points >= lr.points_cost AND
      (
        CASE v_user_tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'platinum' THEN 4
          ELSE 0
        END >= CASE lr.min_tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'platinum' THEN 4
          ELSE 0
        END
      )
    ) AS is_available,
    CASE
      WHEN NOT lr.is_active THEN 'Récompense inactive'
      WHEN lr.start_date IS NOT NULL AND lr.start_date > NOW() THEN 'Récompense pas encore disponible'
      WHEN lr.end_date IS NOT NULL AND lr.end_date < NOW() THEN 'Récompense expirée'
      WHEN v_user_points < lr.points_cost THEN 'Points insuffisants'
      WHEN (
        CASE v_user_tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'platinum' THEN 4
          ELSE 0
        END < CASE lr.min_tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'platinum' THEN 4
          ELSE 0
        END
      ) THEN 'Niveau de fidélité insuffisant'
      ELSE NULL
    END AS reason_if_unavailable,
    lr.start_date,
    lr.end_date
  FROM loyalty_rewards lr
  WHERE lr.is_active = TRUE
  ORDER BY 
    lr.points_cost ASC,
    lr.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les récompenses réclamées par un utilisateur
CREATE OR REPLACE FUNCTION get_user_loyalty_reward_claims(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  claim_id INTEGER,
  reward_id INTEGER,
  reward_name VARCHAR(255),
  reward_description TEXT,
  reward_type VARCHAR(50),
  reward_value JSONB,
  points_spent INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lrc.id AS claim_id,
    lrc.reward_id,
    lr.name AS reward_name,
    lr.description AS reward_description,
    lr.reward_type,
    lr.reward_value,
    lrc.points_spent,
    lrc.status,
    lrc.created_at,
    lrc.used_at,
    lrc.expires_at
  FROM loyalty_reward_claims lrc
  JOIN loyalty_rewards lr ON lrc.reward_id = lr.id
  WHERE lrc.user_id = p_user_id
  ORDER BY lrc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Création des politiques de sécurité RLS
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_reward_claims ENABLE ROW LEVEL SECURITY;

-- Politiques pour loyalty_accounts
CREATE POLICY "Users can view their own loyalty account" 
ON loyalty_accounts FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can insert loyalty accounts" 
ON loyalty_accounts FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can update loyalty accounts" 
ON loyalty_accounts FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions" 
ON loyalty_transactions FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can insert loyalty transactions" 
ON loyalty_transactions FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour loyalty_rewards
CREATE POLICY "Loyalty rewards are viewable by everyone" 
ON loyalty_rewards FOR SELECT USING (true);

CREATE POLICY "Only system can insert loyalty rewards" 
ON loyalty_rewards FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can update loyalty rewards" 
ON loyalty_rewards FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour loyalty_reward_claims
CREATE POLICY "Users can view their own loyalty reward claims" 
ON loyalty_reward_claims FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can insert loyalty reward claims" 
ON loyalty_reward_claims FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Only system can update loyalty reward claims" 
ON loyalty_reward_claims FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Insertion de récompenses de test
INSERT INTO loyalty_rewards (name, description, points_cost, reward_type, reward_value, min_tier, is_active)
VALUES 
  ('Remise de 10%', 'Obtenez une remise de 10% sur votre prochain abonnement', 500, 'discount', '{"percentage": 10, "max_amount": 10}', 'bronze', TRUE),
  ('Remise de 20%', 'Obtenez une remise de 20% sur votre prochain abonnement', 1000, 'discount', '{"percentage": 20, "max_amount": 20}', 'silver', TRUE),
  ('Mois gratuit', 'Obtenez un mois gratuit sur n''importe quel service', 2000, 'free_month', '{"months": 1}', 'gold', TRUE),
  ('Cashback', 'Obtenez 5€ de cashback sur votre compte', 1500, 'cash', '{"amount": 5, "currency": "EUR"}', 'silver', TRUE),
  ('Service Premium gratuit', 'Obtenez un mois gratuit du service Premium', 3000, 'service', '{"service_id": 1, "months": 1}', 'gold', TRUE),
  ('Consultation financière gratuite', 'Obtenez une consultation financière gratuite', 5000, 'service', '{"service_id": 5, "quantity": 1}', 'platinum', TRUE);
