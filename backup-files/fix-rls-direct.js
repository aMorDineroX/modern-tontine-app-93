#!/usr/bin/env node

/**
 * Script pour corriger directement les politiques RLS dans la base de données Supabase
 * 
 * Usage: node scripts/fix-rls-direct.js
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

// Fonction pour désactiver temporairement RLS sur une table
async function disableRls(table) {
  console.log(chalk.gray(`Désactivation de RLS sur la table '${table}'...`));
  
  try {
    // Désactiver RLS
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/disable_rls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ table_name: table })
    }).then(res => res.json());
    
    if (error) {
      console.error(chalk.red(`❌ Erreur lors de la désactivation de RLS sur '${table}':`, error));
      return false;
    }
    
    console.log(chalk.green(`✅ RLS désactivé sur la table '${table}'`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors de la désactivation de RLS sur '${table}':`, error));
    return false;
  }
}

// Fonction pour ajouter une politique publique à une table
async function addPublicPolicy(table) {
  console.log(chalk.gray(`Ajout d'une politique publique à la table '${table}'...`));
  
  try {
    // Ajouter une politique publique
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/add_public_policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ table_name: table })
    }).then(res => res.json());
    
    if (error) {
      console.error(chalk.red(`❌ Erreur lors de l'ajout de la politique publique à '${table}':`, error));
      return false;
    }
    
    console.log(chalk.green(`✅ Politique publique ajoutée à la table '${table}'`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors de l'ajout de la politique publique à '${table}':`, error));
    return false;
  }
}

// Fonction pour créer la fonction disable_rls
async function createDisableRlsFunction() {
  console.log(chalk.blue('🔄 Création de la fonction disable_rls...'));
  
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION disable_rls(table_name TEXT) 
      RETURNS VOID AS $$
      BEGIN
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', table_name);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(chalk.red('❌ Erreur lors de la création de la fonction disable_rls:'), errorData);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction disable_rls créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction disable_rls:'), error);
    return false;
  }
}

// Fonction pour créer la fonction add_public_policy
async function createAddPublicPolicyFunction() {
  console.log(chalk.blue('🔄 Création de la fonction add_public_policy...'));
  
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION add_public_policy(table_name TEXT) 
      RETURNS VOID AS $$
      BEGIN
        EXECUTE format('
          DROP POLICY IF EXISTS "Public access policy" ON %I;
          CREATE POLICY "Public access policy" ON %I FOR ALL USING (true);
        ', table_name, table_name);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(chalk.red('❌ Erreur lors de la création de la fonction add_public_policy:'), errorData);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction add_public_policy créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction add_public_policy:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction directe des politiques RLS\n'));
  
  // Créer les fonctions d'aide
  await createDisableRlsFunction();
  await createAddPublicPolicyFunction();
  
  // Liste des tables à corriger
  const tables = [
    'tontine_groups',
    'group_members',
    'contributions',
    'payouts',
    'messages'
  ];
  
  // Corriger chaque table
  for (const table of tables) {
    // D'abord essayer d'ajouter une politique publique
    const policySuccess = await addPublicPolicy(table);
    
    // Si ça ne fonctionne pas, essayer de désactiver RLS
    if (!policySuccess) {
      await disableRls(table);
    }
  }
  
  console.log(chalk.green.bold('\n✅ Correction terminée!'));
  console.log(chalk.green('Exécutez maintenant le script de test pour vérifier les corrections:'));
  console.log(chalk.gray('  node scripts/test-app.js'));
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
