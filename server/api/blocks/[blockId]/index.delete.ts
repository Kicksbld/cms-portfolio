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
  const blockId = getRouterParam(event, "blockId");

  if (!blockId) {
    throw createError({
      statusCode: 400,
      message: "ID du bloc manquant",
    });
  }

  const { data: block, error: blockError } = await supabase
    .from("block")
    .select("id, project_id")
    .eq("id", blockId)
    .single();

  if (blockError || !block) {
    throw createError({
      statusCode: 404,
      message: "Bloc non trouvé",
    });
  }

  const { data: project, error: projectError } = await supabase
    .from("project")
    .select("id, user_id")
    .eq("id", block.project_id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 403,
      message: "Accès non autorisé",
    });
  }

  const { error } = await supabase.from("block").delete().eq("id", blockId);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression du bloc",
      data: error.message,
    });
  }

  return {
    success: true,
    message: "Bloc supprimé avec succés",
  };
});
