import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "ID utilisateur requis",
    });
  }

  const supabase = createSupabaseServerClient(event);

  // Fetch user profile from auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    throw createError({
      statusCode: 404,
      message: "Utilisateur non trouvé",
    });
  }

  return {
    data: {
      id: userData.user.id,
      email: userData.user.email,
      display_name: userData.user.user_metadata?.display_name || null,
      created_at: userData.user.created_at,
    },
  };
});
