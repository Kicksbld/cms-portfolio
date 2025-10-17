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

  const body = await readBody(event);

  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du projet est requis",
    });
  }

  const projectData: {
    title: string;
    user_id: string;
    thumbnail?: string;
  } = {
    title: body.title,
    user_id: userData.user.id,
  };

  if (body.thumbnail) {
    projectData.thumbnail = body.thumbnail;
  }

  const { data: project, error } = await supabase
    .from("project")
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création du projet",
      data: error.message,
    });
  }

  return {
    data: project,
  };
});
