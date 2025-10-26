import { createSupabaseServerClient } from "../../../../utils/supabase.server";
import { createError, getRouterParam, getQuery } from "h3";

const PROJECTS_PER_PAGE = 3;

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "ID utilisateur requis",
    });
  }

  const supabase = createSupabaseServerClient(event);

  // Calculate pagination
  const from = (page - 1) * PROJECTS_PER_PAGE;
  const to = from + PROJECTS_PER_PAGE - 1;

  // Fetch projects with pagination
  const { data: projects, error, count } = await supabase
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
    `, { count: 'exact' })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des projets",
      data: error.message,
    });
  }

  const formatted = (projects || []).map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    description: p.description,
    created_at: p.created_at,
    categories: p.projectCategory?.map((pc) => pc.category) || [],
  }));

  return {
    data: formatted,
    pagination: {
      page,
      perPage: PROJECTS_PER_PAGE,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / PROJECTS_PER_PAGE),
    },
  };
});
