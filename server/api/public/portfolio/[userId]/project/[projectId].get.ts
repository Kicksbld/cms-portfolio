import { createSupabaseServerClient } from "../../../../../utils/supabase.server";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');
  const projectId = getRouterParam(event, 'projectId');

  if (!userId || !projectId) {
    throw createError({
      statusCode: 400,
      message: "ID utilisateur et ID projet requis",
    });
  }

  const supabase = createSupabaseServerClient(event);

  // Fetch project with categories
  const { data: project, error: projectError } = await supabase
    .from("project")
    .select(`
      id,
      title,
      thumbnail,
      description,
      created_at,
      projectCategory (
        category:categories (
          id,
          name
        )
      )
    `)
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    throw createError({
      statusCode: 404,
      message: "Projet non trouvé",
    });
  }

  // Fetch blocks for this project
  const { data: blocks, error: blocksError } = await supabase
    .from("block")
    .select("*")
    .eq("project_id", projectId)
    .order("id", { ascending: true });

  if (blocksError) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des blocs",
      data: blocksError.message,
    });
  }

  return {
    data: {
      id: project.id,
      title: project.title,
      thumbnail: project.thumbnail,
      description: project.description,
      created_at: project.created_at,
      categories: project.projectCategory?.map((pc) => pc.category) || [],
      blocks: blocks || [],
    },
  };
});
