import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError, readBody } from "h3";
import authGuard from "../../_authGard";

const VALID_TYPES = ["scholaire", "professionnel"] as const;

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

  // Verify experience exists and belongs to user
  const { data: experience, error: experienceError } = await supabase
    .from("experience")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (experienceError || !experience) {
    throw createError({
      statusCode: 404,
      message: "Expérience non trouvée ou accès non autorisé",
    });
  }

  const body = await readBody(event);

  const updateData: {
    title?: string;
    type?: string;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (body.type !== undefined) {
    if (!VALID_TYPES.includes(body.type)) {
      throw createError({
        statusCode: 400,
        message: `Le type doit être "scholaire" ou "professionnel"`,
      });
    }
    updateData.type = body.type;
  }

  if (body.location !== undefined) {
    updateData.location = body.location || null;
  }

  if (body.start_date !== undefined) {
    updateData.start_date = body.start_date || null;
  }

  if (body.end_date !== undefined) {
    updateData.end_date = body.end_date || null;
  }

  if (body.description !== undefined) {
    updateData.description = body.description || null;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      message: "Aucune donnée à mettre à jour",
    });
  }

  const { data: updatedExperience, error } = await supabase
    .from("experience")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise à jour de l'expérience",
      data: error.message,
    });
  }

  return {
    data: updatedExperience,
  };
});
