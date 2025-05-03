// Script to check Supabase storage
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the project
const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  try {
    console.log('Checking Supabase storage...');
    
    // List all buckets
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage error:', error);
      return false;
    }
    
    console.log('Storage is accessible!');
    console.log('Buckets:', data);
    
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

checkStorage();
