import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readMultipartFormData } from "h3";
import authGuard from "../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);

  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({
      statusCode: 400,
      message: "Aucun formData reçu",
    });
  }

  const title = form.find((f) => f.name === "title")?.data?.toString();
  const description = form
    .find((f) => f.name === "description")
    ?.data?.toString();
  const thumbnail = form.find((f) => f.name === "thumbnail");

  if (!title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du projet est requis",
    });
  }

  let thumbnailUrl = null;

  if (thumbnail && thumbnail.data) {
    const fileName = `${user.id}-${Date.now()}-${thumbnail.filename}`;
    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(fileName, thumbnail.data, {
        contentType: thumbnail.type,
      });

    if (uploadError) {
      throw createError({
        statusCode: 500,
        message: `Erreur upload image : ${uploadError.message}`,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("projects")
      .getPublicUrl(fileName);

    thumbnailUrl = publicUrlData.publicUrl;
  }

  const projectData = {
    title,
    user_id: user.id,
    thumbnail: thumbnailUrl,
    description: description || null,
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
