import { createSupabaseServerClient } from '../../utils/supabase.server';
import { readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis',
    });
  }

  const supabase = createSupabaseServerClient(event);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw createError({
      statusCode: 401,
      message: `Identifiants invalides : ${error.message}`,
    });
  }

  const { data: profileConnected, error: profileError } =
    await supabase.auth.signInWithPassword({
      email: data.user?.email ?? '',
      password: password,
    });

  if (profileError) {
    throw createError({
      statusCode: 401,
      message: `Error in logon : ${profileError.message}`,
    });
  }

  return {
    data: profileConnected,
  };
});
