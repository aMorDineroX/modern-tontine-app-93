#!/usr/bin/env node

/**
 * Script pour vérifier la connexion à la base de données Supabase et les tables existantes
 * 
 * Usage: node scripts/check-database.js
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

// Liste des tables à vérifier
const tables = [
  'profiles',
  'tontine_groups',
  'group_members',
  'contributions',
  'payouts',
  'services',
  'user_services',
  'messages',
  'notifications',
  'user_points',
  'achievements',
  'user_achievements',
  'promo_codes',
  'user_roles'
];

/**
 * Vérifie la connexion à Supabase
 */
async function checkConnection() {
  try {
    console.log(chalk.blue('🔄 Vérification de la connexion à Supabase...'));
    
    // Vérifier la connexion en récupérant la session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(chalk.red('❌ Erreur de connexion:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Connexion réussie à Supabase!'));
    console.log(chalk.gray('Session:'), data);
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur de connexion:'), error);
    return false;
  }
}

/**
 * Vérifie l'existence des tables
 */
async function checkTables() {
  console.log(chalk.blue('\n🔄 Vérification des tables...'));
  
  const tableStatus = [];
  
  for (const table of tables) {
    try {
      console.log(chalk.gray(`Vérification de la table '${table}'...`));
      
      // Vérifier si la table existe en essayant de récupérer le nombre de lignes
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(chalk.yellow(`⚠️ Table '${table}': ${error.message}`));
        tableStatus.push({ name: table, exists: false, error: error.message });
      } else {
        console.log(chalk.green(`✅ Table '${table}': ${count} lignes`));
        tableStatus.push({ name: table, exists: true, count });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la vérification de la table '${table}':`, error));
      tableStatus.push({ name: table, exists: false, error: error.message });
    }
  }
  
  // Afficher un résumé
  console.log(chalk.blue('\n📊 Résumé des tables:'));
  
  const existingTables = tableStatus.filter(t => t.exists);
  const missingTables = tableStatus.filter(t => !t.exists);
  
  console.log(chalk.green(`✅ Tables existantes: ${existingTables.length}/${tables.length}`));
  console.log(chalk.yellow(`⚠️ Tables manquantes: ${missingTables.length}/${tables.length}`));
  
  if (missingTables.length > 0) {
    console.log(chalk.yellow('\nTables manquantes:'));
    missingTables.forEach(table => {
      console.log(chalk.yellow(`- ${table.name}: ${table.error}`));
    });
    
    console.log(chalk.blue('\n💡 Pour créer les tables manquantes:'));
    console.log(chalk.gray('1. Connectez-vous au tableau de bord Supabase: https://app.supabase.com'));
    console.log(chalk.gray('2. Sélectionnez votre projet'));
    console.log(chalk.gray('3. Allez dans l\'éditeur SQL'));
    console.log(chalk.gray('4. Exécutez le script de migration: supabase/migrations/20240611_initial_schema.sql'));
  }
  
  return existingTables.length === tables.length;
}

/**
 * Fonction principale
 */
async function main() {
  console.log(chalk.blue.bold('🔍 Vérification de la base de données Supabase\n'));
  console.log(chalk.gray(`URL: ${supabaseUrl}`));
  
  const connected = await checkConnection();
  
  if (connected) {
    const allTablesExist = await checkTables();
    
    if (allTablesExist) {
      console.log(chalk.green.bold('\n✅ Toutes les tables existent et sont accessibles!'));
    } else {
      console.log(chalk.yellow.bold('\n⚠️ Certaines tables sont manquantes ou inaccessibles.'));
    }
  } else {
    console.log(chalk.red.bold('\n❌ Impossible de se connecter à Supabase.'));
    console.log(chalk.yellow('Vérifiez vos informations de connexion et votre connexion réseau.'));
  }
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
