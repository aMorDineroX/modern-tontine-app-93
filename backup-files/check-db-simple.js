// Simple script to check Supabase database connection
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

const supabase = createClient(supabaseUrl, supabaseKey);

// List of tables to check
const tables = [
  'tontine_groups',
  'group_members',
  'contributions',
  'payouts',
  'profiles',
  'services',
  'user_points',
  'achievements',
  'messages',
  'notifications',
  'loyalty_accounts',
  'promo_codes'
];

async function checkConnection() {
  console.log('Checking Supabase connection...');
  
  try {
    // Simple query to check connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('Connection successful!');
    console.log('Session:', data);
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
}

async function checkTables() {
  console.log('\nChecking tables...');
  
  for (const table of tables) {
    try {
      console.log(`Checking table '${table}'...`);
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error with table '${table}':`, error);
      } else {
        console.log(`Table '${table}' exists with ${count} rows.`);
      }
    } catch (error) {
      console.error(`Error checking table '${table}':`, error);
    }
  }
}

async function main() {
  const connected = await checkConnection();
  
  if (connected) {
    await checkTables();
  }
}

main();
