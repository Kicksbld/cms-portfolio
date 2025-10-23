import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError } from "h3";
import authGuard from "../../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID de l'expérience manquant",
    });
  }

  // Verify experience exists and belongs to user
  const { data: experience, error: experienceError } = await supabase
    .from("experience")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (experienceError || !experience) {
    throw createError({
      statusCode: 404,
      message: "Expérience non trouvée ou accès non autorisé",
    });
  }

  const { error } = await supabase.from("experience").delete().eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression de l'expérience",
      data: error.message,
    });
  }

  return {
    success: true,
    message: "Expérience supprimée avec succès",
  };
});
