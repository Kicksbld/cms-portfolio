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

  // Fetch all categories (categories are global, not user-specific)
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des catégories",
      data: error.message,
    });
  }

  return { data: categories || [] };
});
