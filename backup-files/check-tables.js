// Script to check Supabase tables
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

async function checkTables() {
  console.log('Checking tables...');
  
  for (const table of tables) {
    try {
      console.log(`Checking table '${table}'...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Error with table '${table}':`, error.message);
      } else {
        console.log(`Table '${table}' exists with ${data.length} rows returned.`);
        if (data.length > 0) {
          console.log(`Sample data:`, data[0]);
        }
      }
    } catch (error) {
      console.error(`Error checking table '${table}':`, error);
    }
  }
}

checkTables();
