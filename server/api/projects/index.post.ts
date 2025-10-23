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
  const categoriesJson = form.find((f) => f.name === "categories")?.data?.toString();

  if (!title) {
    throw createError({
      statusCode: 400,
      message: "Le titre du projet est requis",
    });
  }

  // Parse category IDs from JSON
  let categoryIds: number[] = [];
  if (categoriesJson) {
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

  // Associate categories with the project
  if (categoryIds.length > 0) {
    const projectCategoryData = categoryIds.map((categoryId) => ({
      project_id: project.id,
      category_id: categoryId,
    }));

    const { error: categoryError } = await supabase
      .from("projectCategory")
      .insert(projectCategoryData);

    if (categoryError) {
      console.error("Failed to associate categories:", categoryError);
      // Don't fail the whole request if category association fails
    }
  }

  // Fetch the project with categories to return
  const { data: projectWithCategories, error: fetchError } = await supabase
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
    .eq("id", project.id)
    .single();

  if (fetchError || !projectWithCategories) {
    // Fallback to basic project data if fetch with categories fails
    return {
      data: {
        ...project,
        categories: [],
      },
    };
  }

  const formatted = {
    id: projectWithCategories.id,
    title: projectWithCategories.title,
    thumbnail: projectWithCategories.thumbnail,
    description: projectWithCategories.description,
    categories: projectWithCategories.projectCategory?.map((pc) => pc.category) || [],
  };

  return {
    data: formatted,
  };
});
