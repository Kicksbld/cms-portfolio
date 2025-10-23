import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError } from "h3";
import authGuard from "../../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID du projet manquant",
    });
  }

  const { data: project, error } = await supabase
    .from("project")
    .select(
      `
      id,
      title,
      thumbnail,
      description,
      user_id,
      projectCategory (
        category:categories (
          id,
          name
        )
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !project) {
    throw createError({
      statusCode: error ? 500 : 404,
      message: error ? "Erreur lors de la récupération du projet" : "Projet non trouvé",
      data: error?.message,
    });
  }

  const formatted = {
    id: project.id,
    title: project.title,
    thumbnail: project.thumbnail,
    description: project.description,
    categories: project.projectCategory?.map((pc) => pc.category) || [],
  };

  return {
    data: formatted,
  };
});
