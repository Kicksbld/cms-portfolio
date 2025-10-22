import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError, readBody } from "h3";
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
      message: "Projet non trouvé ou accés non autorisé",
    });
  }

  const body = await readBody(event);

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du bloc est requis",
    });
  }

  const blockData = {
    project_id: projectId,
    title: body.title,
    description: body.description || null,
    url: body.url || null,
  };

  const { data: block, error } = await supabase
    .from("block")
    .insert(blockData)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création du bloc",
      data: error.message,
    });
  }

  return {
    data: block,
  };
});
