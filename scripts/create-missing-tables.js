#!/usr/bin/env node

/**
 * Script pour créer les tables manquantes dans la base de données Supabase
 * 
 * Usage: node scripts/create-missing-tables.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Charger les variables d'environnement
dotenv.config();

// Utiliser les variables d'environnement ou les valeurs par défaut
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zctvkxwnrhxdiuzuptof.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer la table tontine_groups
async function createTontineGroupsTable() {
  console.log(chalk.blue('🔄 Création de la table tontine_groups...'));
  
  const sql = `
    -- Create custom types if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'frequency') THEN
        CREATE TYPE frequency AS ENUM ('weekly', 'biweekly', 'monthly');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_method') THEN
        CREATE TYPE payout_method AS ENUM ('rotation', 'random', 'bidding');
      END IF;
    END$$;
    
    -- Create tontine_groups table
    CREATE TABLE IF NOT EXISTS tontine_groups (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contribution_amount DECIMAL(10, 2) NOT NULL,
      frequency frequency NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      payout_method payout_method NOT NULL,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE tontine_groups ENABLE ROW LEVEL SECURITY;
    
    -- Add a simple policy
    DROP POLICY IF EXISTS "Simple access policy" ON tontine_groups;
    CREATE POLICY "Simple access policy" ON tontine_groups FOR ALL USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la table tontine_groups:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Table tontine_groups créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la table tontine_groups:'), error);
    return false;
  }
}

// Fonction pour créer la table group_members
async function createGroupMembersTable() {
  console.log(chalk.blue('🔄 Création de la table group_members...'));
  
  const sql = `
    -- Create custom types if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'member');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
        CREATE TYPE member_status AS ENUM ('active', 'pending', 'inactive');
      END IF;
    END$$;
    
    -- Create group_members table
    CREATE TABLE IF NOT EXISTS group_members (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES tontine_groups(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role user_role NOT NULL DEFAULT 'member',
      status member_status NOT NULL DEFAULT 'pending',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(group_id, user_id)
    );
    
    -- Enable RLS
    ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
    
    -- Add a simple policy
    DROP POLICY IF EXISTS "Simple access policy" ON group_members;
    CREATE POLICY "Simple access policy" ON group_members FOR ALL USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la table group_members:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Table group_members créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la table group_members:'), error);
    return false;
  }
}

// Fonction pour créer la table contributions
async function createContributionsTable() {
  console.log(chalk.blue('🔄 Création de la table contributions...'));
  
  const sql = `
    -- Create custom types if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contribution_status') THEN
        CREATE TYPE contribution_status AS ENUM ('pending', 'paid', 'missed');
      END IF;
    END$$;
    
    -- Create contributions table
    CREATE TABLE IF NOT EXISTS contributions (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES tontine_groups(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      status contribution_status NOT NULL DEFAULT 'pending',
      payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
    
    -- Add a simple policy
    DROP POLICY IF EXISTS "Simple access policy" ON contributions;
    CREATE POLICY "Simple access policy" ON contributions FOR ALL USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la table contributions:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Table contributions créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la table contributions:'), error);
    return false;
  }
}

// Fonction pour créer la table payouts
async function createPayoutsTable() {
  console.log(chalk.blue('🔄 Création de la table payouts...'));
  
  const sql = `
    -- Create custom types if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
        CREATE TYPE payout_status AS ENUM ('scheduled', 'paid', 'pending');
      END IF;
    END$$;
    
    -- Create payouts table
    CREATE TABLE IF NOT EXISTS payouts (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES tontine_groups(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
      status payout_status NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
    
    -- Add a simple policy
    DROP POLICY IF EXISTS "Simple access policy" ON payouts;
    CREATE POLICY "Simple access policy" ON payouts FOR ALL USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la table payouts:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Table payouts créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la table payouts:'), error);
    return false;
  }
}

// Fonction pour créer la table messages
async function createMessagesTable() {
  console.log(chalk.blue('🔄 Création de la table messages...'));
  
  const sql = `
    -- Create messages table
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES tontine_groups(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    -- Add a simple policy
    DROP POLICY IF EXISTS "Simple access policy" ON messages;
    CREATE POLICY "Simple access policy" ON messages FOR ALL USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la table messages:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Table messages créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la table messages:'), error);
    return false;
  }
}

// Fonction pour créer la fonction exec_sql
async function createExecSqlFunction() {
  console.log(chalk.blue('🔄 Création de la fonction exec_sql...'));
  
  try {
    // Créer la fonction exec_sql via l'API REST
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: `
        CREATE OR REPLACE FUNCTION exec_sql(sql TEXT) 
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (!response.ok) {
      console.error(chalk.red('❌ Erreur lors de la création de la fonction exec_sql:'), await response.text());
      return false;
    }
    
    console.log(chalk.green('✅ Fonction exec_sql créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction exec_sql:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Création des tables manquantes\n'));
  
  // Créer la fonction exec_sql
  await createExecSqlFunction();
  
  // Créer les tables manquantes
  await createTontineGroupsTable();
  await createGroupMembersTable();
  await createContributionsTable();
  await createPayoutsTable();
  await createMessagesTable();
  
  console.log(chalk.green.bold('\n✅ Création des tables terminée!'));
  console.log(chalk.green('Exécutez maintenant le script de test pour vérifier les corrections:'));
  console.log(chalk.gray('  node scripts/test-app.js'));
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
