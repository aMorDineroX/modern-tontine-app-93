-- Migration pour ajouter les tables de codes promotionnels à Supabase

-- Table des codes promotionnels
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10, 2) NOT NULL, -- Pourcentage ou montant fixe
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0, -- Montant minimum d'achat
  max_discount_amount DECIMAL(10, 2) DEFAULT NULL, -- Montant maximum de remise (pour les pourcentages)
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL, -- Nombre maximum d'utilisations
  current_uses INTEGER DEFAULT 0, -- Nombre actuel d'utilisations
  is_active BOOLEAN DEFAULT TRUE,
  applies_to_service_id INTEGER REFERENCES services(id) ON DELETE SET NULL, -- NULL pour tous les services
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisations de codes promotionnels
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id SERIAL PRIMARY KEY,
  promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  transaction_id INTEGER REFERENCES service_transactions(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL, -- Montant de la remise appliquée
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id, transaction_id)
);

-- Fonction pour valider un code promotionnel
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_service_id INTEGER,
  p_amount DECIMAL(10, 2)
)
RETURNS TABLE (
  is_valid BOOLEAN,
  message TEXT,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  promo_code_id INTEGER
) AS $$
DECLARE
  v_promo_code RECORD;
  v_user_uses INTEGER;
BEGIN
  -- Récupérer le code promotionnel
  SELECT * INTO v_promo_code
  FROM promo_codes
  WHERE code = p_code AND is_active = TRUE;
  
  -- Vérifier si le code existe
  IF v_promo_code IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Code promotionnel invalide', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Vérifier si le code est valide pour la période actuelle
  IF (v_promo_code.valid_from IS NOT NULL AND NOW() < v_promo_code.valid_from) OR
     (v_promo_code.valid_until IS NOT NULL AND NOW() > v_promo_code.valid_until) THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Code promotionnel expiré ou pas encore valide', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Vérifier si le code a atteint son nombre maximum d'utilisations
  IF v_promo_code.max_uses IS NOT NULL AND v_promo_code.current_uses >= v_promo_code.max_uses THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Code promotionnel a atteint son nombre maximum d''utilisations', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Vérifier si l'utilisateur a déjà utilisé ce code
  SELECT COUNT(*) INTO v_user_uses
  FROM promo_code_uses
  WHERE promo_code_id = v_promo_code.id AND user_id = p_user_id;
  
  IF v_user_uses > 0 THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Vous avez déjà utilisé ce code promotionnel', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Vérifier si le code est applicable au service spécifié
  IF v_promo_code.applies_to_service_id IS NOT NULL AND v_promo_code.applies_to_service_id != p_service_id THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Code promotionnel non applicable à ce service', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Vérifier si le montant minimum d'achat est atteint
  IF p_amount < v_promo_code.min_purchase_amount THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Montant minimum d''achat non atteint pour ce code promotionnel', 
      NULL::VARCHAR(20), 
      NULL::DECIMAL(10, 2), 
      NULL::DECIMAL(10, 2), 
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Le code est valide
  RETURN QUERY SELECT 
    TRUE, 
    'Code promotionnel valide', 
    v_promo_code.discount_type, 
    v_promo_code.discount_value, 
    v_promo_code.max_discount_amount, 
    v_promo_code.id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour appliquer un code promotionnel
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_service_id INTEGER,
  p_amount DECIMAL(10, 2),
  p_transaction_id INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  discount_amount DECIMAL(10, 2)
) AS $$
DECLARE
  v_validation RECORD;
  v_discount_amount DECIMAL(10, 2);
  v_promo_code_id INTEGER;
BEGIN
  -- Valider le code promotionnel
  SELECT * INTO v_validation
  FROM validate_promo_code(p_code, p_user_id, p_service_id, p_amount);
  
  IF NOT v_validation.is_valid THEN
    RETURN QUERY SELECT FALSE, v_validation.message, 0::DECIMAL(10, 2);
    RETURN;
  END IF;
  
  -- Calculer le montant de la remise
  IF v_validation.discount_type = 'percentage' THEN
    v_discount_amount := p_amount * (v_validation.discount_value / 100);
    
    -- Appliquer le montant maximum de remise si nécessaire
    IF v_validation.max_discount_amount IS NOT NULL AND v_discount_amount > v_validation.max_discount_amount THEN
      v_discount_amount := v_validation.max_discount_amount;
    END IF;
  ELSE -- 'fixed_amount'
    v_discount_amount := v_validation.discount_value;
    
    -- S'assurer que la remise ne dépasse pas le montant total
    IF v_discount_amount > p_amount THEN
      v_discount_amount := p_amount;
    END IF;
  END IF;
  
  -- Enregistrer l'utilisation du code promotionnel
  INSERT INTO promo_code_uses (
    promo_code_id,
    user_id,
    service_id,
    transaction_id,
    discount_amount
  ) VALUES (
    v_validation.promo_code_id,
    p_user_id,
    p_service_id,
    p_transaction_id,
    v_discount_amount
  );
  
  -- Mettre à jour le nombre d'utilisations du code
  UPDATE promo_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = v_validation.promo_code_id;
  
  -- Retourner le succès
  RETURN QUERY SELECT TRUE, 'Code promotionnel appliqué avec succès', v_discount_amount;
END;
$$ LANGUAGE plpgsql;

-- Insertion de codes promotionnels de test
INSERT INTO promo_codes (
  code,
  description,
  discount_type,
  discount_value,
  min_purchase_amount,
  max_discount_amount,
  valid_from,
  valid_until,
  max_uses,
  is_active
) VALUES 
  ('BIENVENUE10', 'Remise de 10% pour les nouveaux utilisateurs', 'percentage', 10, 0, 50, NOW(), NOW() + INTERVAL '30 days', 100, TRUE),
  ('PREMIUM20', 'Remise de 20% sur l''abonnement Premium', 'percentage', 20, 0, NULL, NOW(), NOW() + INTERVAL '15 days', 50, TRUE),
  ('NAAT5', 'Remise fixe de 5€ sur tous les services', 'fixed_amount', 5, 10, NULL, NOW(), NOW() + INTERVAL '60 days', NULL, TRUE);

-- Mise à jour de la table service_transactions pour inclure les remises
ALTER TABLE service_transactions
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE SET NULL;

-- Création des politiques de sécurité RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;

-- Politiques pour promo_codes (lecture publique, écriture admin)
CREATE POLICY "Promo codes are viewable by everyone" 
ON promo_codes FOR SELECT USING (true);

CREATE POLICY "Promo codes are insertable by admins only" 
ON promo_codes FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Promo codes are updatable by admins only" 
ON promo_codes FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Promo codes are deletable by admins only" 
ON promo_codes FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour promo_code_uses (lecture utilisateur concerné, lecture/écriture admin)
CREATE POLICY "Users can view their own promo code uses" 
ON promo_code_uses FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Users can insert their own promo code uses" 
ON promo_code_uses FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Only admins can update promo code uses" 
ON promo_code_uses FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
