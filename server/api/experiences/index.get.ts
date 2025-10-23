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

  const { data: experiences, error } = await supabase
    .from("experience")
    .select(`
      id,
      user_id,
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
