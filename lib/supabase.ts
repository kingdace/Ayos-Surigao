import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensures auth state is persisted across app restarts
    storage: undefined, // Use default storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // For mobile apps, we don't need email confirmation redirects
    flowType: 'pkce',
  },
});
