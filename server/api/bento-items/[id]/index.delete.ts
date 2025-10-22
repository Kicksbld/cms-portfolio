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
      message: "ID de l'item bento manquant",
    });
  }

  // Fetch the item to get its bento_id
  const { data: bentoItem, error: itemError } = await supabase
    .from("BentoItemContent")
    .select("id, bento_id")
    .eq("id", id)
    .single();

  if (itemError || !bentoItem) {
    throw createError({
      statusCode: 404,
      message: "Item bento non trouvé",
    });
  }

  // Verify the parent block belongs to the user
  const { data: bentoBlock, error: blockError } = await supabase
    .from("BentoBlock")
    .select("id, user_id")
    .eq("id", bentoItem.bento_id)
    .eq("user_id", user.id)
    .single();

  if (blockError || !bentoBlock) {
    throw createError({
      statusCode: 403,
      message: "Accès non autorisé",
    });
  }

  // Delete the item
  const { error } = await supabase
    .from("BentoItemContent")
    .delete()
    .eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression de l'item bento",
      data: error.message,
    });
  }

  return {
    success: true,
    message: "Item bento supprimé avec succès",
  };
});
