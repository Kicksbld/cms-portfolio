import { createSupabaseServerClient } from "../../../utils/supabase.server";
import { createError, readMultipartFormData } from "h3";
import authGuard from "../../_authGard";
import { validateProjectThumbnail, generateSafeFilename } from "../../../utils/fileUpload";
import { validateProjectTitle, validateDescription } from "../../../utils/validation";

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
      message: "ID du projet manquant",
    });
  }

  // Verify project ownership
  const { data: existingProject, error: projectError } = await supabase
    .from("project")
    .select("id, user_id, thumbnail")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !existingProject) {
    throw createError({
      statusCode: 404,
      message: "Projet non trouvé",
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
  const thumbnail = form.find((f) => f.name === "thumbnail");
  const categoriesJson = form.find((f) => f.name === "categories")?.data?.toString();

  const updateData: {
    title?: string;
    description?: string | null;
    thumbnail?: string;
  } = {};

  // Validate and sanitize title if provided
  if (title !== undefined) {
    const titleValidation = validateProjectTitle(title);
    if (!titleValidation.isValid) {
      throw createError({
        statusCode: 400,
        message: titleValidation.error || "Titre invalide",
      });
    }
    updateData.title = titleValidation.sanitized;
  }

  // Validate and sanitize description if provided
  if (description !== undefined) {
    if (description) {
      const descValidation = validateDescription(description);
      if (!descValidation.isValid) {
        throw createError({
          statusCode: 400,
          message: descValidation.error || "Description invalide",
        });
      }
      updateData.description = descValidation.sanitized;
    } else {
      updateData.description = null;
    }
  }

  // Handle thumbnail upload if a new image is provided
  if (thumbnail && thumbnail.data) {
    // SECURITY: Validate file before upload (type, size, signature)
    validateProjectThumbnail(thumbnail);

    // Generate secure filename
    const fileName = generateSafeFilename(user.id, thumbnail.filename);

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

    updateData.thumbnail = publicUrlData.publicUrl;

    // Optional: Delete old thumbnail from storage if it exists
    if (existingProject.thumbnail) {
      try {
        const oldFileName = existingProject.thumbnail.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("projects").remove([oldFileName]);
        }
      } catch (deleteError) {
        console.error("Error deleting old thumbnail:", deleteError);
      }
    }
  }

  // Parse category IDs from JSON
  let categoryIds: number[] | null = null;
  if (categoriesJson !== undefined) {
    try {
      categoryIds = JSON.parse(categoriesJson);
      if (!Array.isArray(categoryIds)) {
        categoryIds = [];
      }
    } catch (e) {
      console.error("Failed to parse categories:", e);
      categoryIds = [];
    }
  }

  if (Object.keys(updateData).length === 0 && categoryIds === null) {
    throw createError({
      statusCode: 400,
      message: "Aucune donnée a mettre a jour",
    });
  }

  // Update project data
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("project")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la mise a jour du projet",
        data: error.message,
      });
    }
  }

  // Update categories if provided
  if (categoryIds !== null) {
    // Delete existing category associations
    await supabase.from("projectCategory").delete().eq("project_id", id);

    // Add new category associations
    if (categoryIds.length > 0) {
      const projectCategoryData = categoryIds.map((categoryId) => ({
        project_id: parseInt(id),
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("projectCategory")
        .insert(projectCategoryData);

      if (categoryError) {
        console.error("Failed to update categories:", categoryError);
      }
    }
  }

  // Fetch updated project with categories
  const { data: updatedProject, error: fetchError } = await supabase
    .from("project")
    .select(`
      id,
      title,
      thumbnail,
      description,
      projectCategory (
        category:categories (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (fetchError || !updatedProject) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération du projet mis à jour",
    });
  }

  const formatted = {
    id: updatedProject.id,
    title: updatedProject.title,
    thumbnail: updatedProject.thumbnail,
    description: updatedProject.description,
    categories: updatedProject.projectCategory?.map((pc) => pc.category) || [],
  };

  return {
    data: formatted,
  };
});
