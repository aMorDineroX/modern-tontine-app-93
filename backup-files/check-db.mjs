// Script to check Supabase database connection and list tables
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    console.log('Checking Supabase connection...');
    
    // Simple query to check connection
    const { data, error } = await supabase.from('tontine_groups').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('Connection successful!');
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
}

async function listTables() {
  try {
    console.log('\nListing tables...');
    
    // Query to get list of tables from PostgreSQL system tables
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error('Error listing tables:', error);
      
      // Fallback: try to query known tables
      console.log('\nTrying to query known tables...');
      
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
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        console.log(`Table '${table}': ${error ? 'Not found or no access' : 'Exists'}`);
      }
      
      return;
    }
    
    console.log('Tables in database:');
    data.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

async function main() {
  const connected = await checkConnection();
  
  if (connected) {
    await listTables();
  }
}

main();
