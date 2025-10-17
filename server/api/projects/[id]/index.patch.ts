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

  const body = await readBody(event);

  const updateData: {
    title?: string;
    thumbnail?: string;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (body.thumbnail !== undefined) {
    updateData.thumbnail = body.thumbnail;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      message: "Aucune donnée a mettre a jour",
    });
  }

  const { data: project, error } = await supabase
    .from("project")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise a jour du projet",
      data: error.message,
    });
  }

  return {
    data: project,
  };
});
