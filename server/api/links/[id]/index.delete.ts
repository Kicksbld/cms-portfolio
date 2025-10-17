import { createSupabaseServerClient } from '../../../utils/supabase.server';
import { createError } from 'h3';
import authGuard from '../../_authGard';
export default defineEventHandler(async (event) => {
  const user = await authGuard(event);
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const supabase = createSupabaseServerClient(event);

  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID du link manquant',
    });
  }

  const { error } = await supabase.from('link').delete().eq('id', id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression du link',
      data: error.message,
    });
  }

  return {
    success: true,
    message: 'link supprimé avec succés',
  };
});
