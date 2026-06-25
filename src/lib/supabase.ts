import { createClient } from '@supabase/supabase-js'

// These environment variables should be defined in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We export a singleton instance of the Supabase client.
// If the keys are empty (e.g. during local dev before setting up Supabase), 
// we gracefully handle it by returning null or a mock, but for now we initialize it.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
