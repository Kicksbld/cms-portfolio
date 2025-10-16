import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw createError({
      statusCode: 401,
      message: error.message,
    });
  }

  deleteCookie(event, 'sb-access-token', { path: '/' });
  deleteCookie(event, 'sb-refresh-token', { path: '/' });

  return {
    message: 'Déconnexion réussie',
  };
});
