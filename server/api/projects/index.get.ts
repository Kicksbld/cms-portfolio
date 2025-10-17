import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);

  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const { data: projects, error } = await supabase
    .from("project")
    .select(
      `
      id,
      title,
      thumbnail
    `
    )
    .order("id", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des projets",
      data: error.message,
    });
  }

  return {
    data: projects || [],
  };
});
