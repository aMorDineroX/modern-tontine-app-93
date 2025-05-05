// Simple script to check Supabase database connection
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

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

checkConnection();
