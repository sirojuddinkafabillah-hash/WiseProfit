import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('[WiseProfit] Supabase env is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ecbtnkuqbygfhoofhvut.supabase.co',
  supabasePublishableKey || 'sb_publishable_YXPB8Uy-Tqkd9BqME7-Xkw_AvDb7pM_',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('user_id').limit(1);
    // A permission error still means the API answered, but missing table/config does not mean data works.
    if (error && !['42501', 'PGRST116'].includes(error.code || '')) {
      console.warn('[WiseProfit] Supabase check:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[WiseProfit] Supabase connection failed:', error);
    return false;
  }
}
