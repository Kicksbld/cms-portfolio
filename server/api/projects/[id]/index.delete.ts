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
      message: "ID du projet manquant",
    });
  }

  // CRITICAL SECURITY: Verify project ownership before deletion
  const { data: project, error: projectError } = await supabase
    .from("project")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 404,
      message: "Projet non trouvé ou accès non autorisé",
    });
  }

  const { error } = await supabase
    .from("project")
    .delete()
    .eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression du projet",
    });
  }

  return {
    success: true,
    message: "Projet supprimé avec succés",
  };
});
