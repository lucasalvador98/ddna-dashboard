/**
 * Shared config for ETL scripts — loads from .env.local
 * Usage: import { supabase } from './config.mjs';
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY no está en .env.local. Creá el archivo a partir de .env.local.example');
}

export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
