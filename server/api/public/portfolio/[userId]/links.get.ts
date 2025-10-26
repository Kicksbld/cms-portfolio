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

  const { data: links, error } = await supabase
    .from("link")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des liens",
      data: error.message,
    });
  }

  return {
    data: links || [],
  };
});
