import type { SupabaseClient } from '@supabase/supabase-js';

declare module 'nuxt/app' {
  interface NuxtApp {
    $supabase: SupabaseClient;
    $supabaseServer: SupabaseClient;
  }
}

export {};
