/**
 * Storage Layer Index
 *
 * This module exports the appropriate storage implementation based on configuration.
 * It supports both Supabase (persistent) and In-Memory storage.
 */

export { SupabaseStorage, createSupabaseStorage } from './supabase-storage';
