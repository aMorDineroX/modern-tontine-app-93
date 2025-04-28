-- Migration pour ajouter les tables de services à Supabase

-- Table des services disponibles
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval VARCHAR(20) DEFAULT NULL, -- 'day', 'week', 'month', 'year'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des abonnements aux services
CREATE TABLE IF NOT EXISTS service_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50) DEFAULT 'paypal', -- 'paypal', 'credit_card', 'bank_transfer'
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Table des transactions de services
CREATE TABLE IF NOT EXISTS service_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES service_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed', 'refunded'
  payment_method VARCHAR(50) DEFAULT 'paypal', -- 'paypal', 'credit_card', 'bank_transfer'
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des fonctionnalités des services
CREATE TABLE IF NOT EXISTS service_features (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des services par défaut
INSERT INTO services (name, description, icon, price, currency, is_recurring, recurring_interval, is_active)
VALUES 
  ('Premium', 'Accès à toutes les fonctionnalités premium de Naat', 'crown', 9.99, 'EUR', TRUE, 'month', TRUE),
  ('Assurance Tontine', 'Protection contre les défauts de paiement des membres', 'shield', 4.99, 'EUR', TRUE, 'month', TRUE),
  ('Analyse Financière', 'Rapports détaillés sur vos finances et économies', 'chart-bar', 2.99, 'EUR', TRUE, 'month', TRUE),
  ('Transfert International', 'Envoi d''argent à l''international sans frais', 'globe', 1.99, 'EUR', FALSE, NULL, TRUE),
  ('Consultation Financière', 'Session de 30 minutes avec un conseiller financier', 'user', 29.99, 'EUR', FALSE, NULL, TRUE);

-- Insertion des fonctionnalités pour chaque service
-- Premium
INSERT INTO service_features (service_id, name, description, is_highlighted)
VALUES 
  (1, 'Groupes illimités', 'Créez autant de groupes de tontine que vous le souhaitez', TRUE),
  (1, 'Pas de publicités', 'Expérience sans publicités', FALSE),
  (1, 'Support prioritaire', 'Accès à notre équipe de support dédiée', FALSE),
  (1, 'Statistiques avancées', 'Accès à des analyses détaillées de vos finances', TRUE),
  (1, 'Exportation des données', 'Exportez vos données dans différents formats', FALSE);

-- Assurance Tontine
INSERT INTO service_features (service_id, name, description, is_highlighted)
VALUES 
  (2, 'Garantie de paiement', 'Nous couvrons les paiements manqués par les membres', TRUE),
  (2, 'Vérification des membres', 'Vérification approfondie des nouveaux membres', FALSE),
  (2, 'Alertes de risque', 'Notifications en cas de comportement suspect', FALSE),
  (2, 'Rapport mensuel', 'Rapport mensuel sur la santé financière de vos groupes', TRUE);

-- Analyse Financière
INSERT INTO service_features (service_id, name, description, is_highlighted)
VALUES 
  (3, 'Tableau de bord personnalisé', 'Visualisez vos finances de manière claire et intuitive', TRUE),
  (3, 'Prévisions d''épargne', 'Projections de vos économies futures', FALSE),
  (3, 'Comparaison avec d''autres utilisateurs', 'Voyez comment vous vous situez par rapport aux autres', FALSE),
  (3, 'Recommandations personnalisées', 'Conseils adaptés à votre situation financière', TRUE);

-- Transfert International
INSERT INTO service_features (service_id, name, description, is_highlighted)
VALUES 
  (4, 'Sans frais cachés', 'Transparence totale sur les coûts', TRUE),
  (4, 'Rapide et sécurisé', 'Transferts effectués en 24-48h', FALSE),
  (4, 'Disponible dans 150+ pays', 'Couverture mondiale', TRUE),
  (4, 'Taux de change avantageux', 'Meilleurs taux que les banques traditionnelles', FALSE);

-- Consultation Financière
INSERT INTO service_features (service_id, name, description, is_highlighted)
VALUES 
  (5, 'Conseiller expert', 'Session avec un conseiller financier certifié', TRUE),
  (5, 'Plan financier personnalisé', 'Recevez un plan adapté à vos objectifs', FALSE),
  (5, 'Suivi post-consultation', 'Support continu après votre session', FALSE),
  (5, 'Disponible en plusieurs langues', 'Consultations en français, anglais et espagnol', TRUE);

-- Création des fonctions RPC pour la gestion des services
CREATE OR REPLACE FUNCTION get_user_services(p_user_id UUID)
RETURNS TABLE (
  service_id INTEGER,
  service_name VARCHAR(255),
  service_description TEXT,
  service_icon VARCHAR(255),
  subscription_status VARCHAR(20),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS service_id,
    s.name AS service_name,
    s.description AS service_description,
    s.icon AS service_icon,
    ss.status AS subscription_status,
    ss.start_date AS subscription_start_date,
    ss.end_date AS subscription_end_date,
    s.is_active
  FROM services s
  LEFT JOIN service_subscriptions ss ON s.id = ss.service_id AND ss.user_id = p_user_id
  WHERE s.is_active = TRUE
  ORDER BY s.id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour s'abonner à un service
CREATE OR REPLACE FUNCTION subscribe_to_service(
  p_user_id UUID,
  p_service_id INTEGER,
  p_payment_method VARCHAR(50),
  p_payment_reference VARCHAR(255)
)
RETURNS INTEGER AS $$
DECLARE
  v_subscription_id INTEGER;
  v_service_record RECORD;
  v_next_payment_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer les informations du service
  SELECT * INTO v_service_record FROM services WHERE id = p_service_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found';
  END IF;
  
  -- Calculer la prochaine date de paiement pour les abonnements récurrents
  IF v_service_record.is_recurring THEN
    CASE v_service_record.recurring_interval
      WHEN 'day' THEN v_next_payment_date := NOW() + INTERVAL '1 day';
      WHEN 'week' THEN v_next_payment_date := NOW() + INTERVAL '1 week';
      WHEN 'month' THEN v_next_payment_date := NOW() + INTERVAL '1 month';
      WHEN 'year' THEN v_next_payment_date := NOW() + INTERVAL '1 year';
      ELSE v_next_payment_date := NULL;
    END CASE;
  ELSE
    v_next_payment_date := NULL;
  END IF;
  
  -- Insérer ou mettre à jour l'abonnement
  INSERT INTO service_subscriptions (
    user_id, 
    service_id, 
    status, 
    start_date, 
    last_payment_date, 
    next_payment_date, 
    payment_method, 
    payment_reference
  )
  VALUES (
    p_user_id, 
    p_service_id, 
    'active', 
    NOW(), 
    NOW(), 
    v_next_payment_date, 
    p_payment_method, 
    p_payment_reference
  )
  ON CONFLICT (user_id, service_id) 
  DO UPDATE SET 
    status = 'active',
    start_date = NOW(),
    last_payment_date = NOW(),
    next_payment_date = v_next_payment_date,
    payment_method = p_payment_method,
    payment_reference = p_payment_reference,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;
  
  -- Enregistrer la transaction
  INSERT INTO service_transactions (
    user_id,
    service_id,
    subscription_id,
    amount,
    currency,
    status,
    payment_method,
    payment_reference
  )
  VALUES (
    p_user_id,
    p_service_id,
    v_subscription_id,
    v_service_record.price,
    v_service_record.currency,
    'completed',
    p_payment_method,
    p_payment_reference
  );
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour annuler un abonnement
CREATE OR REPLACE FUNCTION cancel_service_subscription(
  p_user_id UUID,
  p_subscription_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_affected_rows INTEGER;
BEGIN
  UPDATE service_subscriptions
  SET 
    status = 'cancelled',
    end_date = NOW(),
    updated_at = NOW()
  WHERE 
    id = p_subscription_id AND
    user_id = p_user_id;
    
  GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
  
  RETURN v_affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Création des politiques de sécurité RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_features ENABLE ROW LEVEL SECURITY;

-- Politiques pour services (lecture publique, écriture admin)
CREATE POLICY "Services are viewable by everyone" 
ON services FOR SELECT USING (true);

CREATE POLICY "Services are insertable by admins only" 
ON services FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Services are updatable by admins only" 
ON services FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Services are deletable by admins only" 
ON services FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour service_features (lecture publique, écriture admin)
CREATE POLICY "Service features are viewable by everyone" 
ON service_features FOR SELECT USING (true);

CREATE POLICY "Service features are insertable by admins only" 
ON service_features FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Service features are updatable by admins only" 
ON service_features FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Service features are deletable by admins only" 
ON service_features FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour service_subscriptions (lecture/écriture utilisateur concerné, lecture admin)
CREATE POLICY "Users can view their own subscriptions" 
ON service_subscriptions FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Users can insert their own subscriptions" 
ON service_subscriptions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own subscriptions" 
ON service_subscriptions FOR UPDATE USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Politiques pour service_transactions (lecture utilisateur concerné, lecture/écriture admin)
CREATE POLICY "Users can view their own transactions" 
ON service_transactions FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Users can insert their own transactions" 
ON service_transactions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Only admins can update transactions" 
ON service_transactions FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
