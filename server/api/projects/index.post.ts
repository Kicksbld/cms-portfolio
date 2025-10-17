import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);

  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const body = await readBody(event);

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du projet est requis",
    });
  }

  const projectData = {
    title: body.title,
    user_id: userData.user.id,
    thumbnail: body.thumbnail || null,
    description: body.description || null,
  };

  const { data: project, error: projectError } = await supabase
    .from("project")
    .insert(projectData)
    .select()
    .single();

  if (projectError) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création du projet",
      data: projectError.message,
    });
  }

  return {
    data: {
      ...project,
    },
  };
});
