#!/usr/bin/env node

/**
 * Script pour corriger la fonction has_role dans la base de données Supabase
 * 
 * Usage: node scripts/fix-has-role.js
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
  
  try {
    // Créer la fonction has_role
    const { data, error } = await supabase.functions.invoke('create-has-role', {
      body: { key: 'secret_key' }
    });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de l\'appel de la fonction Edge:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Fonction has_role créée avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔧 Correction de la fonction has_role dans la base de données Supabase\n'));
  
  // Créer la fonction has_role
  await createHasRoleFunction();
  
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
