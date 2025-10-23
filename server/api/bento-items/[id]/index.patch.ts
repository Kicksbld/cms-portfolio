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

  const body = await readBody(event);

  if (!body.contentText) {
    throw createError({
      statusCode: 400,
      message: "Le contenu de l'item est requis",
    });
  }

  // Update the item
  const { data: updatedItem, error } = await supabase
    .from("BentoItemContent")
    .update({ contentText: body.contentText })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise à jour de l'item bento",
      data: error.message,
    });
  }

  return {
    data: updatedItem,
  };
});
