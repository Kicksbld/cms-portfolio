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

  // CRITICAL SECURITY: Verify link ownership before deletion
  const { data: link, error: linkError } = await supabase
    .from('link')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (linkError || !link) {
    throw createError({
      statusCode: 404,
      message: 'Lien non trouvé ou accès non autorisé',
    });
  }

  const { error } = await supabase.from('link').delete().eq('id', id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression du link',
    });
  }

  return {
    success: true,
    message: 'link supprimé avec succés',
  };
});
