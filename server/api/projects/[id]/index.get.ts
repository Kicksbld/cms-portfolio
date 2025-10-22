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
