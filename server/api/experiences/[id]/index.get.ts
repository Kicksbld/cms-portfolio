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
      message: "ID de l'expérience manquant",
    });
  }

  const { data: experience, error } = await supabase
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !experience) {
    throw createError({
      statusCode: 404,
      message: "Expérience non trouvée ou accès non autorisé",
    });
  }

  return {
    data: experience,
  };
});
