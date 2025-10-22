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
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID du bloc bento manquant",
    });
  }

  // Verify block exists and belongs to user
  const { data: bentoBlock, error: blockError } = await supabase
    .from("BentoBlock")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (blockError || !bentoBlock) {
    throw createError({
      statusCode: 404,
      message: "Bloc bento non trouvé ou accès non autorisé",
    });
  }

  const body = await readBody(event);

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du bloc bento est requis",
    });
  }

  // Update the block
  const { data: updatedBlock, error } = await supabase
    .from("BentoBlock")
    .update({ title: body.title })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise à jour du bloc bento",
      data: error.message,
    });
  }

  return {
    data: updatedBlock,
  };
});
