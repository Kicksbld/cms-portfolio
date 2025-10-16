import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
  // Récupère le client Supabase côté serveur avec les cookies
  const supabase = createSupabaseServerClient(event);

  // Récupère l'utilisateur connecté
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    throw createError({
      statusCode: 401,
      message: error.message || 'Utilisateur non connecté',
    });
  }

  if (!user?.user) {
    throw createError({
      statusCode: 401,
      message: 'Aucun utilisateur trouvé',
    });
  }

  return {
    data: {
      message: 'ok',
      user: {
        id: user.user.id,
        email: user.user.email,
        display_name: user.user.user_metadata?.display_name || null,
      },
    },
  };
});
