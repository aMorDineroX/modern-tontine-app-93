#!/usr/bin/env node

/**
 * Script pour corriger directement la fonction has_role dans la base de données Supabase
 * 
 * Usage: node scripts/fix-has-role-direct.js
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
  console.log(chalk.blue.bold('🔧 Correction directe de la fonction has_role\n'));
  
  try {
    // Tester si la fonction has_role existe
    console.log(chalk.gray('Test de la fonction has_role...'));
    
    const { data: testData, error: testError } = await supabase.rpc('has_role', { role: 'user' });
    
    if (!testError) {
      console.log(chalk.green('✅ La fonction has_role existe déjà et fonctionne correctement'));
      return;
    }
    
    if (testError && !testError.message.includes('has_role')) {
      console.log(chalk.green('✅ La fonction has_role existe mais a retourné une erreur:'), testError.message);
      return;
    }
    
    console.log(chalk.yellow('⚠️ La fonction has_role n\'existe pas, tentative de création...'));
    
    // Créer la fonction has_role avec un paramètre p_role
    console.log(chalk.gray('Création de la fonction has_role avec paramètre p_role...'));
    
    const { data: createData1, error: createError1 } = await supabase.rpc('create_function', {
      function_name: 'has_role',
      function_params: 'p_role TEXT',
      function_returns: 'BOOLEAN',
      function_body: `
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = p_role
          );
        END;
      `,
      function_language: 'plpgsql',
      security_definer: true
    });
    
    if (createError1) {
      console.log(chalk.yellow('⚠️ Erreur lors de la première tentative:'), createError1.message);
      
      // Essayer avec un paramètre role
      console.log(chalk.gray('Tentative avec paramètre role...'));
      
      const { data: createData2, error: createError2 } = await supabase.rpc('create_function', {
        function_name: 'has_role',
        function_params: 'role TEXT',
        function_returns: 'BOOLEAN',
        function_body: `
          BEGIN
            RETURN EXISTS (
              SELECT 1 FROM user_roles 
              WHERE user_id = auth.uid() AND role = role
            );
          END;
        `,
        function_language: 'plpgsql',
        security_definer: true
      });
      
      if (createError2) {
        console.log(chalk.yellow('⚠️ Erreur lors de la deuxième tentative:'), createError2.message);
        
        // Essayer avec un paramètre $1
        console.log(chalk.gray('Tentative avec paramètre $1...'));
        
        const { data: createData3, error: createError3 } = await supabase.rpc('create_function', {
          function_name: 'has_role',
          function_params: 'role TEXT',
          function_returns: 'BOOLEAN',
          function_body: `
            BEGIN
              RETURN EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() AND role = $1
              );
            END;
          `,
          function_language: 'plpgsql',
          security_definer: true
        });
        
        if (createError3) {
          console.error(chalk.red('❌ Toutes les tentatives ont échoué:'), createError3.message);
          return;
        }
      }
    }
    
    console.log(chalk.green('✅ Fonction has_role créée avec succès'));
    
    // Tester à nouveau la fonction
    console.log(chalk.gray('Test de la fonction has_role après création...'));
    
    const { data: retestData, error: retestError } = await supabase.rpc('has_role', { role: 'user' });
    
    if (retestError) {
      console.error(chalk.red('❌ La fonction has_role existe mais ne fonctionne pas:'), retestError.message);
      return;
    }
    
    console.log(chalk.green('✅ La fonction has_role fonctionne correctement'));
    console.log(chalk.gray('Résultat:'), retestData);
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
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
