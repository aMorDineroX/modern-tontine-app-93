-- Migration pour ajouter la table paypal_transactions

-- Création de la table paypal_transactions
CREATE TABLE IF NOT EXISTS paypal_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  order_id TEXT,
  subscription_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  type TEXT NOT NULL CHECK (type IN ('payment', 'subscription', 'refund')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Index pour accélérer les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_paypal_transactions_user_id ON paypal_transactions(user_id);

-- Index pour accélérer les recherches par transaction_id
CREATE INDEX IF NOT EXISTS idx_paypal_transactions_transaction_id ON paypal_transactions(transaction_id);

-- Index pour accélérer les recherches par subscription_id
CREATE INDEX IF NOT EXISTS idx_paypal_transactions_subscription_id ON paypal_transactions(subscription_id);

-- Politique de sécurité Row Level Security (RLS)
ALTER TABLE paypal_transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres transactions
CREATE POLICY user_transactions_policy ON paypal_transactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour permettre aux administrateurs de voir toutes les transactions
CREATE POLICY admin_transactions_policy ON paypal_transactions
  FOR ALL
  TO service_role
  USING (true);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE paypal_transactions IS 'Transactions PayPal des utilisateurs';
COMMENT ON COLUMN paypal_transactions.id IS 'Identifiant unique de la transaction dans notre système';
COMMENT ON COLUMN paypal_transactions.user_id IS 'Identifiant de l''utilisateur qui a effectué la transaction';
COMMENT ON COLUMN paypal_transactions.transaction_id IS 'Identifiant de la transaction PayPal';
COMMENT ON COLUMN paypal_transactions.order_id IS 'Identifiant de la commande PayPal (pour les paiements uniques)';
COMMENT ON COLUMN paypal_transactions.subscription_id IS 'Identifiant de l''abonnement PayPal (pour les paiements récurrents)';
COMMENT ON COLUMN paypal_transactions.amount IS 'Montant de la transaction';
COMMENT ON COLUMN paypal_transactions.currency IS 'Devise de la transaction';
COMMENT ON COLUMN paypal_transactions.status IS 'Statut de la transaction (completed, pending, failed, refunded)';
COMMENT ON COLUMN paypal_transactions.type IS 'Type de transaction (payment, subscription, refund)';
COMMENT ON COLUMN paypal_transactions.description IS 'Description de la transaction';
COMMENT ON COLUMN paypal_transactions.created_at IS 'Date et heure de création de la transaction';
COMMENT ON COLUMN paypal_transactions.metadata IS 'Métadonnées supplémentaires de la transaction au format JSON';
