import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readBody } from "h3";
import authGuard from "../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);
  const body = await readBody(event);

  if (!body.bento_id) {
    throw createError({
      statusCode: 400,
      message: "L'ID du bloc bento est requis",
    });
  }

  if (!body.contentText) {
    throw createError({
      statusCode: 400,
      message: "Le contenu de l'item est requis",
    });
  }

  // Verify the bento block exists and belongs to the user
  const { data: bentoBlock, error: blockError } = await supabase
    .from("BentoBlock")
    .select("id, user_id")
    .eq("id", body.bento_id)
    .eq("user_id", user.id)
    .single();

  if (blockError || !bentoBlock) {
    throw createError({
      statusCode: 404,
      message: "Bloc bento non trouvé ou accès non autorisé",
    });
  }

  // Create the item
  const itemData = {
    bento_id: body.bento_id,
    contentText: body.contentText,
  };

  const { data: bentoItem, error } = await supabase
    .from("BentoItemContent")
    .insert(itemData)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création de l'item bento",
      data: error.message,
    });
  }

  return {
    data: bentoItem,
  };
});
