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

  // Delete all associated items first
  const { error: itemsError } = await supabase
    .from("BentoItemContent")
    .delete()
    .eq("bento_id", id);

  if (itemsError) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression des items du bloc bento",
      data: itemsError.message,
    });
  }

  // Delete the block
  const { error } = await supabase
    .from("BentoBlock")
    .delete()
    .eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression du bloc bento",
      data: error.message,
    });
  }

  return {
    success: true,
    message: "Bloc bento supprimé avec succès",
  };
});
