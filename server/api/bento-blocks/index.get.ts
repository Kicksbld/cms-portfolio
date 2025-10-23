import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError } from "h3";
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
  const userId = user.id;

  // Fetch bento blocks with their items
  const { data: bentoBlocks, error } = await supabase
    .from("BentoBlock")
    .select(`
      id,
      user_id,
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
      message: "Erreur lors de la récupération des blocs bento",
      data: error.message,
    });
  }

  // Format the response to match our types
  const formatted = (bentoBlocks || []).map((block) => ({
    id: block.id,
    user_id: block.user_id,
    title: block.title,
    items: block.BentoItemContent || [],
  }));

  return { data: formatted };
});
