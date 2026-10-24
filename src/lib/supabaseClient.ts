import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'faucetflow_supabase_url_v1',
  KEY: 'faucetflow_supabase_key_v1',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = localStorage.getItem(STORAGE_KEYS.URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.KEY);
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localKey || envKey || '').trim();
  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('YOUR_PROJECT_ID') &&
    !anonKey.includes('YOUR_SUPABASE_ANON_KEY')
  );

  return { url, anonKey, isConfigured };
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      clientInstance = null;
    }
  }
  return clientInstance;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEYS.URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.KEY, anonKey.trim());
  clientInstance = null; // Reset instance so it recreates with new config
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.KEY);
  clientInstance = null;
}

export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  const cfg = getSupabaseConfig();
  const url = testUrl || cfg.url;
  const anonKey = testKey || cfg.anonKey;

  if (!url || !anonKey) {
    return { success: false, message: 'Please provide both the Project URL and Anon Key.' };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      success: false,
      message: 'Invalid Supabase URL format. It should look like: https://xyzcompany.supabase.co',
    };
  }

  try {
    const testClient = createClient(url, anonKey);
    // Ping public profiles table
    const { error } = await testClient.from('profiles').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message:
            'Connected to Supabase, but tables were not found. Please run the SQL schema in your Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Supabase error: ${error.message} (${error.code || 'unknown'})` };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase! Database tables and API are active.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Connection failed. Please check your credentials.',
    };
  }
}
