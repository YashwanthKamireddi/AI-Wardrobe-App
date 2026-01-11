/**
 * Supabase Client Configuration
 *
 * This file sets up the Supabase client for database operations.
 * Supabase provides a free tier PostgreSQL database with real-time features.
 *
 * Setup Instructions:
 * 1. Create a free account at https://supabase.com
 * 2. Create a new project
 * 3. Go to Settings > API to get your project URL and anon key
 * 4. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils';

// Generic database type - Supabase will use this without strict table definitions
// This allows more flexibility when tables don't exist or schema differs
export type Database = any;

// Supabase client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase URL from environment variables
 */
function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    logger.warn('SUPABASE_URL not set - using in-memory storage as fallback');
    return '';
  }
  return url;
}

/**
 * Get the Supabase anonymous key from environment variables
 */
function getSupabaseAnonKey(): string {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) {
    logger.warn('SUPABASE_ANON_KEY not set - using in-memory storage as fallback');
    return '';
  }
  return key;
}

/**
 * Initialize and return the Supabase client
 * Returns null if credentials are not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.info('Supabase not configured - using in-memory storage');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    logger.info('Supabase client initialized successfully');
    return supabaseClient;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

/**
 * Test the Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (which is ok)
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    logger.info('Supabase connection test successful');
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Supabase connection test error:', error);
    return false;
  }
}

export default getSupabaseClient;
