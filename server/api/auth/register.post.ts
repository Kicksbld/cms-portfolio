import { createSupabaseServerClient } from "../../utils/supabase.server";
import { readBody, createError } from "h3";
import { rateLimiters } from '../../utils/rateLimit';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  sanitizeString,
} from '../../utils/validation';

export default defineEventHandler(async (event) => {
  // Apply rate limiting - 3 attempts per hour
  rateLimiters.register(event);

  const body = await readBody(event);
  const { email, password, name } = body;

  // Validate required fields
  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      message: "Email, nom et mot de passe requis",
    });
  }

  // Sanitize and validate email
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  if (!validateEmail(sanitizedEmail)) {
    throw createError({
      statusCode: 400,
      message: 'Format d\'email invalide',
    });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw createError({
      statusCode: 400,
      message: passwordValidation.errors[0], // Show first error
    });
  }

  // Validate and sanitize display name
  const nameValidation = validateDisplayName(name);
  if (!nameValidation.isValid) {
    throw createError({
      statusCode: 400,
      message: nameValidation.error || 'Nom d\'affichage invalide',
    });
  }

  const supabase = createSupabaseServerClient(event);

  const { data, error } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
    options: {
      data: { display_name: nameValidation.sanitized },
    },
  });

  if (error) {
    throw createError({
      statusCode: 401,
      message: error.message.includes('already registered')
        ? 'Cette adresse email est déjà utilisée'
        : 'Erreur lors de l\'inscription',
    });
  }

  const { data: profileConnected, error: profileError } =
    await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password,
    });

  if (profileError) {
    throw createError({
      statusCode: 401,
      message: 'Erreur lors de la connexion après inscription',
    });
  }

  return {
    data: profileConnected,
  };
});
