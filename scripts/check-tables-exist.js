#!/usr/bin/env node

/**
 * Script pour vérifier si les tables existent dans la base de données Supabase
 * 
 * Usage: node scripts/check-tables-exist.js
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

// Fonction pour vérifier si une table existe
async function checkTableExists(table) {
  try {
    // Essayer de récupérer une ligne de la table
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(chalk.red(`❌ Table '${table}': ${error.message}`));
      return false;
    }
    
    console.log(chalk.green(`✅ Table '${table}' existe`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors de la vérification de la table '${table}':`, error));
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔍 Vérification de l\'existence des tables\n'));
  
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
  
  // Vérifier chaque table
  const results = [];
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    results.push({ table, exists });
  }
  
  // Afficher un résumé
  console.log(chalk.blue('\n📊 Résumé:'));
  
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  
  console.log(chalk.green(`✅ Tables existantes: ${existingTables.length}/${tables.length}`));
  console.log(chalk.red(`❌ Tables manquantes: ${missingTables.length}/${tables.length}`));
  
  if (missingTables.length > 0) {
    console.log(chalk.red('\nTables manquantes:'));
    missingTables.forEach(table => {
      console.log(chalk.red(`- ${table.table}`));
    });
  }
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
