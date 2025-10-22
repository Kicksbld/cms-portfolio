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

  const { data: projects, error } = await supabase
    .from("project")
    .select(`
      id,
      title,
      thumbnail,
      description,
      project_category (
        category:categories (
          id,
          name
        )
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des projets",
      data: error.message,
    });
  }

  const formatted = (projects || []).map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    description: p.description,
    categories: p.project_category?.map((pc) => pc.category) || [],
  }));

  return { data: formatted };
});