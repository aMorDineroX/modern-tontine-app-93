#!/usr/bin/env node

/**
 * Script pour corriger les tables dans la base de données Supabase
 * 
 * Usage: node scripts/fix-tables.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

// Utiliser les variables d'environnement ou les valeurs par défaut
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zctvkxwnrhxdiuzuptof.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer les tables manquantes
async function createMissingTables() {
  console.log(chalk.blue('🔄 Création des tables manquantes...'));
  
  try {
    // Lire le fichier SQL de création des tables
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'migrations', '20240611_initial_schema.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(chalk.red('❌ Fichier SQL de création des tables introuvable:'), sqlFilePath);
      return false;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création des tables:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Tables créées avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de la création des tables:'), error);
    return false;
  }
}

// Fonction pour ajouter des données de test
async function addTestData() {
  console.log(chalk.blue('🔄 Ajout de données de test...'));
  
  try {
    // Lire le fichier SQL de données de test
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'seed', '00_run_all_seeds.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(chalk.red('❌ Fichier SQL de données de test introuvable:'), sqlFilePath);
      return false;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de l\'ajout des données de test:'), error);
      return false;
    }
    
    console.log(chalk.green('✅ Données de test ajoutées avec succès'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors de l\'ajout des données de test:'), error);
    return false;
  }
}

// Fonction pour créer la fonction has_role
async function createHasRoleFunction() {
  console.log(chalk.blue('🔄 Création de la fonction has_role...'));
  
  try {
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
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la création de la fonction has_role:'), error);
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
  console.log(chalk.blue.bold('🔧 Correction des tables dans la base de données Supabase\n'));
  
  // Créer les tables manquantes
  await createMissingTables();
  
  // Créer la fonction has_role
  await createHasRoleFunction();
  
  // Ajouter des données de test
  await addTestData();
  
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
