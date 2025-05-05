#!/usr/bin/env node

/**
 * Script pour corriger les problèmes de base de données Supabase
 * Version simplifiée qui utilise des requêtes SQL directes
 * 
 * Usage: node scripts/fix-database-simple.js
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
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  console.log(chalk.blue('🔄 Création d\'un utilisateur de test...'));
  
  try {
    // Créer l'utilisateur
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
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
    console.log(chalk.gray('ID utilisateur:'), data.user.id);
    
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

// Fonction pour corriger les politiques RLS
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
    console.log(chalk.gray(`Vérification de la table '${table}'...`));
    
    try {
      // Vérifier si la table existe
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(chalk.yellow(`⚠️ Impossible d'accéder à la table '${table}': ${countError.message}`));
        console.log(chalk.gray('Tentative d\'ajout d\'une politique de sécurité publique...'));
        
        // Essayer d'ajouter une politique publique
        const { data, error } = await supabase.rpc('add_public_policy', { table_name: table });
        
        if (error) {
          console.error(chalk.red(`❌ Erreur lors de l'ajout de la politique pour '${table}': ${error.message}`));
        } else {
          console.log(chalk.green(`✅ Politique publique ajoutée pour la table '${table}'`));
        }
      } else {
        console.log(chalk.green(`✅ Table '${table}' accessible: ${count} lignes`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la vérification de la table '${table}':`, error));
    }
  }
}

// Fonction pour créer la fonction has_role
async function createHasRoleFunction() {
  console.log(chalk.blue('🔄 Création de la fonction has_role...'));
  
  try {
    // Vérifier si la fonction existe déjà
    const { data, error } = await supabase.rpc('has_role', { role: 'user' });
    
    if (!error || !error.message.includes('has_role')) {
      console.log(chalk.green('✅ La fonction has_role existe déjà'));
      return;
    }
    
    console.log(chalk.yellow('⚠️ La fonction has_role n\'existe pas, tentative de création...'));
    
    // Créer la fonction has_role via une fonction d'aide
    const { data: createData, error: createError } = await supabase.rpc('create_has_role_function');
    
    if (createError) {
      console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), createError);
      
      // Essayer une approche alternative
      console.log(chalk.gray('Tentative alternative...'));
      
      // Créer une fonction d'aide pour créer has_role
      const { data: helperData, error: helperError } = await supabase.rpc('create_helper_function');
      
      if (helperError) {
        console.error(chalk.red('❌ Erreur lors de la création de la fonction d\'aide:'), helperError);
        return;
      }
      
      // Utiliser la fonction d'aide pour créer has_role
      const { data: retryData, error: retryError } = await supabase.rpc('create_has_role_function');
      
      if (retryError) {
        console.error(chalk.red('❌ Erreur lors de la seconde tentative:'), retryError);
        return;
      }
    }
    
    console.log(chalk.green('✅ Fonction has_role créée avec succès'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), error);
  }
}

// Fonction pour se connecter avec l'utilisateur de test
async function testLogin() {
  console.log(chalk.blue('🔄 Test de connexion avec l\'utilisateur de test...'));
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (error) {
      console.log(chalk.yellow('⚠️ Impossible de se connecter avec l\'utilisateur de test:'), error.message);
      return false;
    }
    
    console.log(chalk.green('✅ Connexion réussie avec l\'utilisateur de test'));
    console.log(chalk.gray('Session:'), data.session ? 'Valide' : 'Invalide');
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors du test de connexion:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction des problèmes de base de données Supabase\n'));
  console.log(chalk.gray(`URL Supabase: ${supabaseUrl}`));
  
  // Créer un utilisateur de test
  await createTestUser();
  
  // Tester la connexion
  const loginSuccess = await testLogin();
  
  if (loginSuccess) {
    // Corriger les politiques RLS
    await fixRlsPolicies();
    
    // Créer la fonction has_role
    await createHasRoleFunction();
  }
  
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
