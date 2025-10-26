import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "ID utilisateur requis",
    });
  }

  const supabase = createSupabaseServerClient(event);

  // Fetch bento blocks with their items
  const { data: bentoBlocks, error } = await supabase
    .from("BentoBlock")
    .select(`
      id,
      title,
      BentoItemContent (
        id,
        bento_id,
        contentText
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des compétences",
      data: error.message,
    });
  }

  // Format the response
  const formatted = (bentoBlocks || []).map((block) => ({
    id: block.id,
    title: block.title,
    items: block.BentoItemContent || [],
  }));

  return { data: formatted };
});
