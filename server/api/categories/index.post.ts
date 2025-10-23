import { createSupabaseServerClient } from "../../utils/supabase.server";
import { createError, readBody } from "h3";
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
  const body = await readBody(event);

  const { name } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Le nom de la catégorie est requis",
    });
  }

  // Check if category already exists (case-insensitive)
  const { data: existingCategory } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", name.trim())
    .single();

  if (existingCategory) {
    // Return existing category instead of creating duplicate
    return { data: existingCategory };
  }

  // Create new category
  const { data: category, error } = await supabase
    .from("categories")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la création de la catégorie",
      data: error.message,
    });
  }

  return { data: category };
});
