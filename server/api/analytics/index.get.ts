import { createSupabaseServerClient } from '../../utils/supabase.server';
import authGuard from '../_authGard';
import { createError } from 'h3';

/**
 * Get portfolio analytics for the authenticated user
 * This is a PROTECTED endpoint that requires authentication
 */
export default defineEventHandler(async (event) => {
  try {
    // Authenticate the user
    const user = await authGuard(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const supabase = createSupabaseServerClient(event);

    // Fetch analytics for the authenticated user
    const { data: analytics, error } = await supabase
      .from('portfolio_analytics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no analytics found, initialize with zeros
      if (error.code === 'PGRST116') {
        // Row not found, create one
        const { data: newAnalytics, error: insertError } = await supabase
          .from('portfolio_analytics')
          .insert({
            user_id: user.id,
            total_views: 0,
            unique_visitors: 0,
          })
          .select()
          .single();

        if (insertError) {
          throw createError({
            statusCode: 500,
            message: 'Failed to initialize analytics',
          });
        }

        return { data: newAnalytics };
      }

      throw createError({
        statusCode: 500,
        message: error.message,
      });
    }

    return { data: analytics };
  } catch (error: any) {
    console.error('Error fetching analytics:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
});
