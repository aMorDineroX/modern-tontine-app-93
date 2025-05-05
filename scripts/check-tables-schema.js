#!/usr/bin/env node

/**
 * Script pour vérifier si les tables existent dans le schéma de la base de données Supabase
 * 
 * Usage: node scripts/check-tables-schema.js
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

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔍 Vérification des tables dans le schéma\n'));
  
  try {
    // Récupérer la liste des tables
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error(chalk.red('❌ Erreur lors de la récupération des tables:'), error);
      
      // Essayer une autre approche
      console.log(chalk.yellow('⚠️ Tentative alternative...'));
      
      const { data: data2, error: error2 } = await supabase.from('pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
      
      if (error2) {
        console.error(chalk.red('❌ Erreur lors de la récupération des tables (méthode 2):'), error2);
        return;
      }
      
      console.log(chalk.green('✅ Tables trouvées:'));
      data2.forEach(table => {
        console.log(chalk.green(`- ${table.tablename}`));
      });
      
      return;
    }
    
    console.log(chalk.green('✅ Tables trouvées:'));
    data.forEach(table => {
      console.log(chalk.green(`- ${table.table_name}`));
    });
  } catch (error) {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
  }
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
