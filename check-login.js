// Script to check Supabase login
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test credentials - these are just for testing and won't work
// You would need to use real credentials or create a test user
const testEmail = 'test@example.com';
const testPassword = 'password123';

async function testLogin() {
  try {
    console.log(`Trying to login with email: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('Login error:', error);
      return false;
    }
    
    console.log('Login successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

testLogin();
