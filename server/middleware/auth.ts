import { createSupabaseServerClient } from '../utils/supabase.server';

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  event.context.auth = { user };
  // await authMiddleware(event)
  return;
});
