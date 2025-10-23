import { createSupabaseServerClient } from '../../utils/supabase.server';
import { readBody, createError } from 'h3';
import { rateLimiters } from '../../utils/rateLimit';
import { validateEmail, sanitizeString } from '../../utils/validation';

export default defineEventHandler(async (event) => {
  // Apply rate limiting - 5 attempts per 15 minutes
  rateLimiters.login(event);

  const body = await readBody(event);
  const { email, password } = body;

  // Validate required fields
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis',
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

  // Validate password length (basic check to prevent empty passwords)
  if (password.length < 1) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe est requis',
    });
  }

  const supabase = createSupabaseServerClient(event);

  const { data: profileConnected, error: profileError } =
    await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password,
    });

  if (profileError) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect',
    });
  }

  return {
    data: profileConnected,
  };
});
