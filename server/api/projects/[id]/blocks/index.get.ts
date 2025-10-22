import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError } from "h3";
import authGuard from "../../../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);
  const projectId = getRouterParam(event, "id");

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: "ID du projet manquant",
    });
  }

  const { data: project, error: projectError } = await supabase
    .from("project")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 404,
      message: "Projet non trouvé ou accès non autorisé",
    });
  }

  const { data: blocks, error } = await supabase
    .from("block")
    .select(
      `
      id,
      project_id,
      title,
      description,
      url
    `
    )
    .eq("project_id", projectId)
    .order("id", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des blocs",
      data: error.message,
    });
  }

  return {
    data: blocks || [],
  };
});
