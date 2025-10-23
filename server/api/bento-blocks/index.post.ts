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

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du bloc bento est requis",
    });
  }

  // Create the bento block
  const blockData = {
    user_id: user.id,
    title: body.title,
  };

  const { data: bentoBlock, error: blockError } = await supabase
    .from("BentoBlock")
    .insert(blockData)
    .select()
    .single();

  if (blockError) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création du bloc bento",
      data: blockError.message,
    });
  }

  // If initial items are provided, create them
  let items = [];
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    const itemsData = body.items.map((contentText: string) => ({
      bento_id: bentoBlock.id,
      contentText,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from("BentoItemContent")
      .insert(itemsData)
      .select();

    if (itemsError) {
      // If items creation fails, we still return the block
      // but log the error
      console.error("Error creating initial items:", itemsError);
    } else {
      items = createdItems || [];
    }
  }

  return {
    data: {
      ...bentoBlock,
      items,
    },
  };
});
