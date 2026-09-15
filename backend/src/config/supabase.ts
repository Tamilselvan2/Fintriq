import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'placeholder_key_replace_me') {
  console.warn('Supabase credentials are not configured properly. Profile image uploads may fail.');
}

// Initialize the Supabase client with the service-role key for backend operations.
// WARNING: This client bypasses RLS and has full administrative access to the project.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder'
);
