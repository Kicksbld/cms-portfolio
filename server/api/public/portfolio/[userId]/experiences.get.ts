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

  const { data: experiences, error } = await supabase
    .from("experience")
    .select(`
      id,
      title,
      type,
      location,
      start_date,
      end_date,
      description
    `)
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des expériences",
      data: error.message,
    });
  }

  return { data: experiences || [] };
});
