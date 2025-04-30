-- Migration pour ajouter les tables du système de paiement amélioré à Supabase

-- Table des méthodes de paiement des utilisateurs
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'card', 'paypal', 'bank_transfer'
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'bank'
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  last_four VARCHAR(4), -- Pour les cartes
  expiry_date VARCHAR(7), -- Pour les cartes (MM/YYYY)
  card_brand VARCHAR(50), -- Pour les cartes
  email VARCHAR(255), -- Pour PayPal
  bank_name VARCHAR(255), -- Pour les virements bancaires
  account_last_four VARCHAR(4), -- Pour les virements bancaires
  token_id VARCHAR(255), -- ID du token chez le fournisseur de paiement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_payment_type CHECK (type IN ('card', 'paypal', 'bank_transfer'))
);

-- Table des transactions de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'refund'
  description TEXT,
  reference VARCHAR(255) UNIQUE,
  provider_transaction_id VARCHAR(255),
  provider_fee DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT valid_transaction_type CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund'))
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL, -- 'basic', 'premium', 'business'
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal'
  provider_subscription_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial'))
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  provider_invoice_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible'))
);

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY, -- 'basic', 'premium', 'business'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  interval VARCHAR(20) NOT NULL, -- 'month', 'year'
  interval_count INTEGER NOT NULL DEFAULT 1,
  trial_period_days INTEGER DEFAULT NULL,
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_plan_interval CHECK (interval IN ('month', 'year'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les méthodes de paiement
CREATE POLICY "Users can view their own payment methods" 
ON payment_methods FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
ON payment_methods FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
ON payment_methods FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
ON payment_methods FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques RLS pour les transactions
CREATE POLICY "Users can view their own transactions" 
ON payment_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Politiques RLS pour les abonnements
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Politiques RLS pour les factures
CREATE POLICY "Users can view their own invoices" 
ON invoices FOR SELECT 
USING (auth.uid() = user_id);

-- Politiques RLS pour les plans d'abonnement
CREATE POLICY "Anyone can view active subscription plans" 
ON subscription_plans FOR SELECT 
USING (is_active = TRUE);

-- Fonction pour créer une transaction de paiement
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_user_id UUID,
  p_payment_method_id UUID,
  p_amount DECIMAL(10, 2),
  p_currency VARCHAR(3),
  p_status VARCHAR(20),
  p_type VARCHAR(20),
  p_description TEXT,
  p_reference VARCHAR(255),
  p_provider_transaction_id VARCHAR(255) DEFAULT NULL,
  p_provider_fee DECIMAL(10, 2) DEFAULT 0,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO payment_transactions (
    user_id, payment_method_id, amount, currency, status, type, 
    description, reference, provider_transaction_id, provider_fee, metadata
  )
  VALUES (
    p_user_id, p_payment_method_id, p_amount, p_currency, p_status, p_type, 
    p_description, p_reference, p_provider_transaction_id, p_provider_fee, p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le statut d'une transaction
CREATE OR REPLACE FUNCTION update_transaction_status(
  p_transaction_id UUID,
  p_status VARCHAR(20),
  p_provider_transaction_id VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE payment_transactions
  SET 
    status = p_status,
    provider_transaction_id = COALESCE(p_provider_transaction_id, provider_transaction_id),
    updated_at = NOW()
  WHERE id = p_transaction_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un abonnement
CREATE OR REPLACE FUNCTION create_subscription(
  p_user_id UUID,
  p_plan_id VARCHAR(50),
  p_payment_method_id UUID,
  p_provider VARCHAR(50),
  p_provider_subscription_id VARCHAR(255),
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  INSERT INTO subscriptions (
    user_id, plan_id, status, current_period_start, current_period_end,
    payment_method_id, provider, provider_subscription_id, metadata
  )
  VALUES (
    p_user_id, p_plan_id, 'active', p_current_period_start, p_current_period_end,
    p_payment_method_id, p_provider, p_provider_subscription_id, p_metadata
  )
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertion des plans d'abonnement par défaut
INSERT INTO subscription_plans (id, name, description, price, currency, interval, interval_count, trial_period_days, features, is_active)
VALUES 
  ('basic', 'Basique', 'Plan de base avec fonctionnalités essentielles', 0, 'EUR', 'month', 1, NULL, 
   '{"max_groups": 3, "max_members_per_group": 10, "features": ["Création de groupes", "Gestion des membres", "Suivi des contributions"]}', TRUE),
  
  ('premium', 'Premium', 'Plan premium avec fonctionnalités avancées', 9.99, 'EUR', 'month', 1, 14, 
   '{"max_groups": 10, "max_members_per_group": 50, "features": ["Toutes les fonctionnalités basiques", "Analyses avancées", "Notifications en temps réel", "Chat de groupe", "Exportation des données"]}', TRUE),
  
  ('business', 'Business', 'Plan business pour les grandes tontines', 19.99, 'EUR', 'month', 1, 7, 
   '{"max_groups": -1, "max_members_per_group": -1, "features": ["Toutes les fonctionnalités premium", "Nombre illimité de groupes", "Nombre illimité de membres", "Support prioritaire", "API d''intégration", "Personnalisation avancée"]}', TRUE),
  
  ('premium_annual', 'Premium Annuel', 'Plan premium avec facturation annuelle', 99.99, 'EUR', 'year', 1, 14, 
   '{"max_groups": 10, "max_members_per_group": 50, "features": ["Toutes les fonctionnalités basiques", "Analyses avancées", "Notifications en temps réel", "Chat de groupe", "Exportation des données"]}', TRUE),
  
  ('business_annual', 'Business Annuel', 'Plan business avec facturation annuelle', 199.99, 'EUR', 'year', 1, 7, 
   '{"max_groups": -1, "max_members_per_group": -1, "features": ["Toutes les fonctionnalités premium", "Nombre illimité de groupes", "Nombre illimité de membres", "Support prioritaire", "API d''intégration", "Personnalisation avancée"]}', TRUE);

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement enregistrées par les utilisateurs';
COMMENT ON TABLE payment_transactions IS 'Transactions de paiement (dépôts, retraits, paiements)';
COMMENT ON TABLE subscriptions IS 'Abonnements des utilisateurs aux plans payants';
COMMENT ON TABLE invoices IS 'Factures générées pour les transactions et abonnements';
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement disponibles';
