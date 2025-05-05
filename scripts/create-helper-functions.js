#!/usr/bin/env node

/**
 * Script pour créer des fonctions d'aide dans la base de données Supabase
 * 
 * Usage: node scripts/create-helper-functions.js
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

// Fonction pour créer la fonction has_role
async function createHasRoleFunction() {
  console.log(chalk.blue('🔄 Création de la fonction has_role...'));
  
  const sql = `
    CREATE OR REPLACE FUNCTION has_role(role TEXT) 
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = $1
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    // Exécuter le SQL directement via l'API REST
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
      console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), errorData);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction has_role créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), error);
    return false;
  }
}

// Fonction pour créer la fonction add_public_policy
async function createAddPublicPolicyFunction() {
  console.log(chalk.blue('🔄 Création de la fonction add_public_policy...'));
  
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
  
  try {
    // Exécuter le SQL directement via l'API REST
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

// Fonction pour créer la fonction exec_sql
async function createExecSqlFunction() {
  console.log(chalk.blue('🔄 Création de la fonction exec_sql...'));
  
  const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql TEXT) 
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    // Exécuter le SQL directement via l'API REST de Supabase
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
      // Si la fonction n'existe pas encore, essayons de la créer via SQL direct
      console.log(chalk.yellow('⚠️ La fonction exec_sql n\'existe pas encore, tentative de création directe...'));
      
      // Créer la fonction via SQL direct
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: sql
      });
      
      if (!createResponse.ok) {
        console.error(chalk.red('❌ Erreur lors de la création directe de la fonction exec_sql'));
        return false;
      }
      
      console.log(chalk.green('✅ Fonction exec_sql créée avec succès (méthode directe)'));
      return true;
    }
    
    console.log(chalk.green('✅ Fonction exec_sql créée ou mise à jour avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction exec_sql:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Création des fonctions d\'aide dans la base de données Supabase\n'));
  
  // Créer la fonction exec_sql
  const execSqlSuccess = await createExecSqlFunction();
  
  if (execSqlSuccess) {
    // Créer la fonction has_role
    await createHasRoleFunction();
    
    // Créer la fonction add_public_policy
    await createAddPublicPolicyFunction();
  }
  
  console.log(chalk.green.bold('\n✅ Création des fonctions terminée!'));
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
