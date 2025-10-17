import { createSupabaseServerClient } from "../../../utils/supabase.server";
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
      thumbnail
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération du projet",
      data: error.message,
    });
  }
  return {
    data: project,
  };
});
