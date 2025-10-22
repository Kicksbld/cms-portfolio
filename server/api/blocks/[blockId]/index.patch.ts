import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError, readMultipartFormData } from "h3";
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
  const blockId = getRouterParam(event, "blockId");

  if (!blockId) {
    throw createError({
      statusCode: 400,
      message: "ID du bloc manquant",
    });
  }

  const { data: block, error: blockError } = await supabase
    .from("block")
    .select("id, project_id, url")
    .eq("id", blockId)
    .single();

  if (blockError || !block) {
    throw createError({
      statusCode: 404,
      message: "Bloc non trouvé",
    });
  }

  const { data: project, error: projectError } = await supabase
    .from("project")
    .select("id, user_id")
    .eq("id", block.project_id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 403,
      message: "Accès non autorisé",
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

  const updateData: {
    title?: string;
    description?: string | null;
    url?: string | null;
  } = {};

  if (title !== undefined) {
    updateData.title = title;
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  // Handle image upload if a new image is provided
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

    updateData.url = publicUrlData.publicUrl;

    // Optional: Delete old image from storage if it exists
    if (block.url) {
      try {
        const oldFileName = block.url.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("blocks").remove([oldFileName]);
        }
      } catch (deleteError) {
        // Silently fail - old image deletion is not critical
        console.error("Error deleting old image:", deleteError);
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      message: "Aucune donnée a mettre a jour",
    });
  }

  const { data: updatedBlock, error } = await supabase
    .from("block")
    .update(updateData)
    .eq("id", blockId)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la mise a jour du bloc",
      data: error.message,
    });
  }

  return {
    data: updatedBlock,
  };
});
