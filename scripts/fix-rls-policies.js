#!/usr/bin/env node

/**
 * Script pour corriger les politiques RLS dans la base de données Supabase
 * 
 * Usage: node scripts/fix-rls-policies.js
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

// Fonction pour ajouter une politique publique temporaire à une table
async function addPublicPolicy(table) {
  console.log(chalk.gray(`Ajout d'une politique publique temporaire à la table '${table}'...`));
  
  try {
    // Vérifier d'abord si la table est accessible
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(chalk.green(`✅ La table '${table}' est déjà accessible`));
      return true;
    }
    
    // Ajouter une politique publique temporaire
    const { error } = await supabase.rpc('add_public_policy', { table_name: table });
    
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

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction des politiques RLS dans la base de données Supabase\n'));
  
  // Liste des tables à corriger
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
  
  // Ajouter des politiques publiques temporaires à toutes les tables
  for (const table of tables) {
    await addPublicPolicy(table);
  }
  
  console.log(chalk.green.bold('\n✅ Correction des politiques RLS terminée!'));
  console.log(chalk.green('Exécutez maintenant le script de test pour vérifier les corrections:'));
  console.log(chalk.gray('  node scripts/test-app.js'));
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
