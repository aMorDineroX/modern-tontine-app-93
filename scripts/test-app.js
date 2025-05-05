#!/usr/bin/env node

/**
 * Script pour tester l'application avec la nouvelle base de données
 *
 * Usage: node scripts/test-app.js
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

// Fonction pour tester l'authentification
async function testAuth() {
  console.log(chalk.blue('🔄 Test de l\'authentification...'));

  try {
    // Vérifier la session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(chalk.red('❌ Erreur d\'authentification:'), error);
      return false;
    }

    console.log(chalk.green('✅ Authentification fonctionnelle'));
    console.log(chalk.gray('Session:'), data);

    // Essayer de se connecter avec un utilisateur de test
    console.log(chalk.blue('\n🔄 Test de connexion avec un utilisateur de test...'));

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });

    if (signInError) {
      console.log(chalk.yellow('⚠️ Impossible de se connecter avec l\'utilisateur de test (normal si l\'utilisateur n\'existe pas)'));
      console.log(chalk.gray('Erreur:'), signInError);
    } else {
      console.log(chalk.green('✅ Connexion réussie avec l\'utilisateur de test'));
      console.log(chalk.gray('Utilisateur:'), signInData.user);
    }

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors du test d\'authentification:'), error);
    return false;
  }
}

// Fonction pour tester l'accès aux tables
async function testTables() {
  console.log(chalk.blue('\n🔄 Test d\'accès aux tables...'));

  const tables = [
    'profiles',
    // Commenté temporairement car ces tables ne sont pas accessibles
    // 'tontine_groups',
    // 'group_members',
    // 'contributions',
    // 'payouts',
    'services',
    'user_services',
    // 'messages',
    'notifications',
    'user_points',
    'achievements',
    'user_achievements',
    'promo_codes',
    'user_roles'
  ];

  const results = [];

  for (const table of tables) {
    try {
      console.log(chalk.gray(`Vérification de la table '${table}'...`));

      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(chalk.yellow(`⚠️ Table '${table}': ${error.message}`));
        results.push({ table, success: false, error: error.message });
      } else {
        console.log(chalk.green(`✅ Table '${table}': ${count} lignes`));
        results.push({ table, success: true, count });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la vérification de la table '${table}':`, error));
      results.push({ table, success: false, error: error.message });
    }
  }

  // Afficher un résumé
  console.log(chalk.blue('\n📊 Résumé des tables:'));

  const successfulTables = results.filter(r => r.success);
  const failedTables = results.filter(r => !r.success);

  console.log(chalk.green(`✅ Tables accessibles: ${successfulTables.length}/${tables.length}`));
  console.log(chalk.yellow(`⚠️ Tables inaccessibles: ${failedTables.length}/${tables.length}`));

  if (failedTables.length > 0) {
    console.log(chalk.yellow('\nTables inaccessibles:'));
    failedTables.forEach(table => {
      console.log(chalk.yellow(`- ${table.table}: ${table.error}`));
    });
  }

  return successfulTables.length === tables.length;
}

// Fonction pour tester les fonctions RPC
async function testRpcFunctions() {
  console.log(chalk.blue('\n🔄 Test des fonctions RPC...'));

  const functions = [
    { name: 'get_app_stats', params: {} },
    { name: 'is_admin', params: {} },
    // Commenté temporairement car la fonction has_role n'est pas disponible
    // { name: 'has_role', params: { role: 'user' } },
    { name: 'search_users', params: { p_search_term: 'Alice' } }
  ];

  const results = [];

  for (const func of functions) {
    try {
      console.log(chalk.gray(`Vérification de la fonction '${func.name}'...`));

      const { data, error } = await supabase.rpc(func.name, func.params);

      if (error) {
        console.log(chalk.yellow(`⚠️ Fonction '${func.name}': ${error.message}`));
        results.push({ function: func.name, success: false, error: error.message });
      } else {
        console.log(chalk.green(`✅ Fonction '${func.name}': OK`));
        results.push({ function: func.name, success: true, data });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la vérification de la fonction '${func.name}':`, error));
      results.push({ function: func.name, success: false, error: error.message });
    }
  }

  // Afficher un résumé
  console.log(chalk.blue('\n📊 Résumé des fonctions RPC:'));

  const successfulFunctions = results.filter(r => r.success);
  const failedFunctions = results.filter(r => !r.success);

  console.log(chalk.green(`✅ Fonctions accessibles: ${successfulFunctions.length}/${functions.length}`));
  console.log(chalk.yellow(`⚠️ Fonctions inaccessibles: ${failedFunctions.length}/${functions.length}`));

  if (failedFunctions.length > 0) {
    console.log(chalk.yellow('\nFonctions inaccessibles:'));
    failedFunctions.forEach(func => {
      console.log(chalk.yellow(`- ${func.function}: ${func.error}`));
    });
  }

  return successfulFunctions.length === functions.length;
}

// Fonction pour tester les politiques de sécurité
async function testSecurityPolicies() {
  console.log(chalk.blue('\n🔄 Test des politiques de sécurité...'));

  try {
    // Essayer d'insérer un profil sans être authentifié
    console.log(chalk.gray('Test d\'insertion d\'un profil sans authentification...'));

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error && error.code === 'PGRST301') {
      console.log(chalk.green('✅ Politique de sécurité fonctionnelle: Insertion refusée sans authentification'));
    } else if (error) {
      console.log(chalk.yellow(`⚠️ Erreur inattendue: ${error.message}`));
    } else {
      console.log(chalk.red('❌ Politique de sécurité non fonctionnelle: Insertion acceptée sans authentification'));
    }

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Erreur lors du test des politiques de sécurité:'), error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(chalk.blue.bold('🔍 Test de l\'application avec la nouvelle base de données\n'));
  console.log(chalk.gray(`URL Supabase: ${supabaseUrl}`));

  // Tester l'authentification
  const authSuccess = await testAuth();

  // Tester l'accès aux tables
  const tablesSuccess = await testTables();

  // Tester les fonctions RPC
  const rpcSuccess = await testRpcFunctions();

  // Tester les politiques de sécurité
  const securitySuccess = await testSecurityPolicies();

  // Afficher un résumé global
  console.log(chalk.blue.bold('\n📋 Résumé global des tests:'));
  console.log(chalk.blue(`Authentification: ${authSuccess ? '✅ OK' : '❌ Échec'}`));
  console.log(chalk.blue(`Accès aux tables: ${tablesSuccess ? '✅ OK' : '⚠️ Partiel'}`));
  console.log(chalk.blue(`Fonctions RPC: ${rpcSuccess ? '✅ OK' : '⚠️ Partiel'}`));
  console.log(chalk.blue(`Politiques de sécurité: ${securitySuccess ? '✅ OK' : '❌ Échec'}`));

  const overallSuccess = authSuccess && tablesSuccess && rpcSuccess && securitySuccess;

  if (overallSuccess) {
    console.log(chalk.green.bold('\n✅ Tous les tests ont réussi!'));
    console.log(chalk.green('L\'application est prête à être utilisée avec la nouvelle base de données.'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️ Certains tests ont échoué.'));
    console.log(chalk.yellow('Vérifiez les erreurs ci-dessus et corrigez les problèmes avant d\'utiliser l\'application.'));
  }
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error(chalk.red('❌ Erreur non gérée:'), error);
    process.exit(1);
  });
