import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readBody } from "h3";
import authGuard from "../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);
  const body = await readBody(event);

  const { display_name } = body;

  if (!display_name || typeof display_name !== "string" || display_name.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Le nom d'affichage est requis",
    });
  }

  // Update user metadata in Supabase Auth
  const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        display_name: display_name.trim(),
      },
    }
  );

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise à jour du profil",
      data: error.message,
    });
  }

  return {
    data: {
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        display_name: updatedUser.user.user_metadata?.display_name || null,
      },
    },
  };
});
