/* import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError } from 'h3';
import authGuard from '../_authGard';
export default defineEventHandler(async (event) => {
  await authGuard(event);
  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase.from('link').select('*');

  if (error) {
    throw createError({
      statusCode: 401,
      message: `Error get links : ${error.message}`,
    });
  }

  return { data };
});
 */