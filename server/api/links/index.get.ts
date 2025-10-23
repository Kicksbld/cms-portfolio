import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError } from 'h3';
import authGuard from '../_authGard';

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Utilisateur non connecté',
    });
  }

  const supabase = createSupabaseServerClient(event);

  // IMPORTANT: Filter by user_id to prevent accessing other users' links
  const { data, error } = await supabase
    .from('link')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des liens',
      data: error.message,
    });
  }

  return { data: data || [] };
});
