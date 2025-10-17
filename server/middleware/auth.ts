// server/middleware/auth.ts
import { createSupabaseServerClient } from '../utils/supabase.server';

export default defineEventHandler(async (event) => {
  const path = event.path || event.node.req.url;
  console.log(path);
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/user',
  ];

  if (publicRoutes.some((r) => path.startsWith(r))) {
    return;
  }

  const supabase = createSupabaseServerClient(event);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  event.context.auth = { user };
});
