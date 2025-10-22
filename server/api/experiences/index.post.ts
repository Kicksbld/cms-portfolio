import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readBody } from "h3";
import authGuard from "../_authGard";

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
  const body = await readBody(event);

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre de l'expérience est requis",
    });
  }

  if (!body.type) {
    throw createError({
      statusCode: 400,
      message: "Le type de l'expérience est requis",
    });
  }

  if (!VALID_TYPES.includes(body.type)) {
    throw createError({
      statusCode: 400,
      message: `Le type doit être "scholaire" ou "professionnel"`,
    });
  }

  const experienceData = {
    user_id: user.id,
    title: body.title,
    type: body.type,
    location: body.location || null,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    description: body.description || null,
  };

  const { data: experience, error } = await supabase
    .from("experience")
    .insert(experienceData)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création de l'expérience",
      data: error.message,
    });
  }

  return {
    data: experience,
  };
});
