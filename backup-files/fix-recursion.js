#!/usr/bin/env node

/**
 * Script pour corriger la récursion infinie dans les politiques RLS
 * 
 * Usage: node scripts/fix-recursion.js
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

// Fonction pour supprimer toutes les politiques d'une table
async function dropAllPolicies(table) {
  console.log(chalk.gray(`Suppression de toutes les politiques de la table '${table}'...`));
  
  try {
    // Supprimer toutes les politiques
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/drop_all_policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ table_name: table })
    }).then(res => res.json());
    
    if (error) {
      console.error(chalk.red(`❌ Erreur lors de la suppression des politiques de '${table}':`, error));
      return false;
    }
    
    console.log(chalk.green(`✅ Politiques supprimées de la table '${table}'`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors de la suppression des politiques de '${table}':`, error));
    return false;
  }
}

// Fonction pour ajouter une politique simple à une table
async function addSimplePolicy(table) {
  console.log(chalk.gray(`Ajout d'une politique simple à la table '${table}'...`));
  
  try {
    // Ajouter une politique simple
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/add_simple_policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ table_name: table })
    }).then(res => res.json());
    
    if (error) {
      console.error(chalk.red(`❌ Erreur lors de l'ajout de la politique simple à '${table}':`, error));
      return false;
    }
    
    console.log(chalk.green(`✅ Politique simple ajoutée à la table '${table}'`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors de l'ajout de la politique simple à '${table}':`, error));
    return false;
  }
}

// Fonction pour créer la fonction drop_all_policies
async function createDropAllPoliciesFunction() {
  console.log(chalk.blue('🔄 Création de la fonction drop_all_policies...'));
  
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION drop_all_policies(table_name TEXT) 
      RETURNS VOID AS $$
      DECLARE
        policy_name TEXT;
      BEGIN
        FOR policy_name IN (
          SELECT policyname FROM pg_policies WHERE tablename = table_name
        ) LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
        END LOOP;
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
      console.error(chalk.red('❌ Erreur lors de la création de la fonction drop_all_policies:'), errorData);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction drop_all_policies créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction drop_all_policies:'), error);
    return false;
  }
}

// Fonction pour créer la fonction add_simple_policy
async function createAddSimplePolicyFunction() {
  console.log(chalk.blue('🔄 Création de la fonction add_simple_policy...'));
  
  try {
    const sql = `
      CREATE OR REPLACE FUNCTION add_simple_policy(table_name TEXT) 
      RETURNS VOID AS $$
      BEGIN
        EXECUTE format('
          DROP POLICY IF EXISTS "Simple access policy" ON %I;
          CREATE POLICY "Simple access policy" ON %I FOR ALL USING (true);
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
      console.error(chalk.red('❌ Erreur lors de la création de la fonction add_simple_policy:'), errorData);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction add_simple_policy créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction add_simple_policy:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction de la récursion infinie dans les politiques RLS\n'));
  
  // Créer les fonctions d'aide
  await createDropAllPoliciesFunction();
  await createAddSimplePolicyFunction();
  
  // Liste des tables à corriger
  const tables = [
    'group_members',
    'tontine_groups',
    'contributions',
    'payouts',
    'messages'
  ];
  
  // Corriger chaque table
  for (const table of tables) {
    // Supprimer toutes les politiques
    await dropAllPolicies(table);
    
    // Ajouter une politique simple
    await addSimplePolicy(table);
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
