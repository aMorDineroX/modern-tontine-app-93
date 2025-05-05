// Script to check new Supabase connection and tables
import { createClient } from '@supabase/supabase-js';

// New Supabase credentials
const supabaseUrl = 'https://zctvkxwnrhxdiuzuptof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdHZreHducmh4ZGl1enVwdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODEwNzksImV4cCI6MjA2MDE1NzA3OX0.-p1ROiRCbrNvlCZe3IO1CR8PVkkseFDcSbqn3d2DZA8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    console.log('Checking Supabase connection...');
    
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

async function listTables() {
  try {
    console.log('\nListing tables...');
    
    // Query the todos table
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .limit(5);
    
    if (todosError) {
      console.error('Error querying todos table:', todosError);
    } else {
      console.log('Todos table exists with data:');
      console.log(todos);
    }
    
    // Try to list all tables using system tables
    console.log('\nAttempting to list all tables...');
    
    // This is a PostgreSQL query to list all tables in the public schema
    const { data: tableList, error: tableError } = await supabase.rpc('get_tables');
    
    if (tableError) {
      console.error('Error listing tables:', tableError);
      
      // Fallback: try to query some common tables
      console.log('\nTrying to query common tables...');
      
      const tables = [
        'todos',
        'profiles',
        'tontine_groups',
        'group_members',
        'contributions',
        'payouts',
        'services',
        'user_points',
        'achievements',
        'messages',
        'notifications'
      ];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count(*)', { count: 'exact', head: true });
          
          console.log(`Table '${table}': ${error ? 'Not found or no access' : 'Exists'}`);
        } catch (e) {
          console.log(`Table '${table}': Error checking`);
        }
      }
    } else {
      console.log('Tables in database:');
      tableList.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
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
