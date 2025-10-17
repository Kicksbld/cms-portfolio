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

  const { error } = await supabase
    .from("project")
    .delete()
    .eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la suppression du projet",
      data: error.message,
    });
  }

  return {
    success: true,
    message: "Projet supprimé avec succés",
  };
});
