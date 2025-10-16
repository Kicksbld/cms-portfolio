import { createClient } from '@supabase/supabase-js';
import { parseCookies, setCookie } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { H3Event } from 'h3';

export function createSupabaseServerClient(event: H3Event) {
  const config = useRuntimeConfig();

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey
  );

  const cookies = parseCookies(event);
  const access_token = cookies['sb-access-token'];
  const refresh_token = cookies['sb-refresh-token'];

  if (access_token && refresh_token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.setSession({ access_token, refresh_token } as any);
  }

  // Patch pour écriture automatique lors d’un refresh
  supabase.auth.onAuthStateChange((eventName, session) => {
    if (!session) return;

    setCookie(event, 'sb-access-token', session.access_token, {
      httpOnly: true,
      path: '/',
    });
    setCookie(event, 'sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      path: '/',
    });
  });

  return supabase;
}
