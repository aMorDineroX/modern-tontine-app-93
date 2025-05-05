#!/usr/bin/env node

/**
 * Script pour corriger les problèmes de base de données Supabase
 * 
 * Usage: node scripts/fix-database.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Charger les variables d'environnement
dotenv.config();

// Utiliser les variables d'environnement ou les valeurs par défaut
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zctvkxwnrhxdiuzuptof.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  console.log(chalk.blue('🔄 Création d\'un utilisateur de test...'));
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail('test@example.com');
    
    if (existingUser) {
      console.log(chalk.green('✅ L\'utilisateur de test existe déjà'));
      return;
    }
    
    // Créer l'utilisateur
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(chalk.green('✅ L\'utilisateur de test existe déjà'));
      } else {
        console.error(chalk.red('❌ Erreur lors de la création de l\'utilisateur de test:'), error);
      }
      return;
    }
    
    console.log(chalk.green('✅ Utilisateur de test créé avec succès'));
    
    // Créer le profil associé
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error(chalk.red('❌ Erreur lors de la création du profil de test:'), profileError);
      return;
    }
    
    console.log(chalk.green('✅ Profil de test créé avec succès'));
    
    // Ajouter le rôle utilisateur
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.error(chalk.red('❌ Erreur lors de l\'ajout du rôle utilisateur:'), roleError);
      return;
    }
    
    console.log(chalk.green('✅ Rôle utilisateur ajouté avec succès'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de l\'utilisateur de test:'), error);
  }
}

// Fonction pour exécuter les corrections SQL
async function runSqlFixes() {
  console.log(chalk.blue('🔄 Exécution des corrections SQL...'));
  
  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'fix-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Diviser le contenu en instructions SQL individuelles
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Exécuter chaque instruction SQL
    for (const stmt of sqlStatements) {
      console.log(chalk.gray(`Exécution: ${stmt.substring(0, 50)}...`));
      
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        console.error(chalk.red(`❌ Erreur lors de l'exécution de SQL: ${stmt.substring(0, 100)}...`), error);
      }
    }
    
    console.log(chalk.green('✅ Corrections SQL exécutées avec succès'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de l\'exécution des corrections SQL:'), error);
  }
}

// Fonction pour corriger la fonction has_role
async function fixHasRoleFunction() {
  console.log(chalk.blue('🔄 Correction de la fonction has_role...'));
  
  try {
    const functionDefinition = `
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
    
    const { error } = await supabase.rpc('exec_sql', { sql: functionDefinition });
    
    if (error) {
      // Si la fonction exec_sql n'existe pas, essayons une autre approche
      console.log(chalk.yellow('⚠️ La fonction exec_sql n\'existe pas, tentative alternative...'));
      
      // Créer une fonction temporaire pour exécuter du SQL
      const { error: createFuncError } = await supabase.rpc('create_exec_sql_function');
      
      if (createFuncError) {
        console.error(chalk.red('❌ Impossible de créer la fonction exec_sql:'), createFuncError);
        return;
      }
      
      // Réessayer avec la nouvelle fonction
      const { error: retryError } = await supabase.rpc('exec_sql', { sql: functionDefinition });
      
      if (retryError) {
        console.error(chalk.red('❌ Erreur lors de la correction de la fonction has_role:'), retryError);
        return;
      }
    }
    
    console.log(chalk.green('✅ Fonction has_role corrigée avec succès'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la correction de la fonction has_role:'), error);
  }
}

// Fonction pour créer la fonction exec_sql si elle n'existe pas
async function createExecSqlFunction() {
  console.log(chalk.blue('🔄 Création de la fonction exec_sql...'));
  
  try {
    const functionDefinition = `
      CREATE OR REPLACE FUNCTION create_exec_sql_function() 
      RETURNS VOID AS $$
      BEGIN
        CREATE OR REPLACE FUNCTION exec_sql(sql TEXT) 
        RETURNS VOID AS $inner$
        BEGIN
          EXECUTE sql;
        END;
        $inner$ LANGUAGE plpgsql SECURITY DEFINER;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Exécuter cette requête directement via l'API REST de Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_exec_sql_function`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(chalk.red('❌ Erreur lors de la création de la fonction exec_sql:'), errorData);
      return;
    }
    
    console.log(chalk.green('✅ Fonction exec_sql créée avec succès'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction exec_sql:'), error);
  }
}

// Fonction pour corriger les politiques RLS manuellement
async function fixRlsPolicies() {
  console.log(chalk.blue('🔄 Correction des politiques RLS...'));
  
  // Liste des tables à corriger
  const tables = [
    'tontine_groups',
    'group_members',
    'contributions',
    'payouts',
    'messages'
  ];
  
  for (const table of tables) {
    console.log(chalk.gray(`Correction des politiques pour la table '${table}'...`));
    
    try {
      // Activer RLS sur la table
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
      });
      
      if (rlsError) {
        console.error(chalk.red(`❌ Erreur lors de l'activation de RLS sur ${table}:`), rlsError);
        continue;
      }
      
      // Ajouter une politique de base pour la sélection
      const { error: policyError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE POLICY "Allow select for authenticated users" ON ${table}
          FOR SELECT USING (auth.role() = 'authenticated');
        ` 
      });
      
      if (policyError && !policyError.message.includes('already exists')) {
        console.error(chalk.red(`❌ Erreur lors de la création de la politique pour ${table}:`), policyError);
        continue;
      }
      
      console.log(chalk.green(`✅ Politiques RLS corrigées pour la table '${table}'`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la correction des politiques pour ${table}:`), error);
    }
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction des problèmes de base de données Supabase\n'));
  
  // Créer la fonction exec_sql
  await createExecSqlFunction();
  
  // Corriger la fonction has_role
  await fixHasRoleFunction();
  
  // Corriger les politiques RLS
  await fixRlsPolicies();
  
  // Créer un utilisateur de test
  await createTestUser();
  
  console.log(chalk.green.bold('\n✅ Corrections terminées!'));
  console.log(chalk.green('Exécutez maintenant le script de test pour vérifier les corrections:'));
  console.log(chalk.gray('  node scripts/test-app.js'));
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
