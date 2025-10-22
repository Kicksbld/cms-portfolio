import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError, readMultipartFormData } from "h3";
import authGuard from "../../../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  const supabase = createSupabaseServerClient(event);
  const projectId = getRouterParam(event, "id");

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: "ID du projet manquant",
    });
  }

  const { data: project, error: projectError } = await supabase
    .from("project")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 404,
      message: "Projet non trouvé ou accés non autorisé",
    });
  }

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
  const image = form.find((f) => f.name === "image");

  if (!title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du bloc est requis",
    });
  }

  let imageUrl = null;

  if (image && image.data) {
    const fileName = `${user.id}-${Date.now()}-${image.filename}`;
    const { error: uploadError } = await supabase.storage
      .from("blocks")
      .upload(fileName, image.data, {
        contentType: image.type,
      });

    if (uploadError) {
      throw createError({
        statusCode: 500,
        message: `Erreur upload image : ${uploadError.message}`,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("blocks")
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  const blockData = {
    project_id: projectId,
    title,
    description: description || null,
    url: imageUrl,
  };

  const { data: block, error } = await supabase
    .from("block")
    .insert(blockData)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création du bloc",
      data: error.message,
    });
  }

  return {
    data: block,
  };
});
