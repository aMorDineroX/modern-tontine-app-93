// Script to check Supabase auth service
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  try {
    console.log('Checking Supabase auth service...');
    
    // Check if we can access the auth service
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      return false;
    }
    
    console.log('Auth service is accessible!');
    console.log('Session:', data);
    
    // Try to get the user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
    } else {
      console.log('User data:', userData);
    }
    
    return true;
  } catch (error) {
    console.error('Auth error:', error);
    return false;
  }
}

checkAuth();
