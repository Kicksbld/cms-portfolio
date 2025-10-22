import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError, readBody } from "h3";
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
      message: "Accés non autoris�",
    });
  }

  const body = await readBody(event);

  const updateData: {
    title?: string;
    description?: string | null;
    url?: string | null;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (body.description !== undefined) {
    updateData.description = body.description;
  }

  if (body.url !== undefined) {
    updateData.url = body.url;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      message: "Aucune donnée a mettre a jour",
    });
  }

  const { data: updatedBlock, error } = await supabase
    .from("block")
    .update(updateData)
    .eq("id", blockId)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise a jour du bloc",
      data: error.message,
    });
  }

  return {
    data: updatedBlock,
  };
});
