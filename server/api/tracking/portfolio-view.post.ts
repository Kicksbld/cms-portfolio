import { readBody, createError } from 'h3';
import { createSupabaseServerClient } from '../../utils/supabase.server';
import { generateVisitorFingerprint, generateSessionId } from '../../utils/fingerprint';

/**
 * Track portfolio view endpoint
 * This is a PUBLIC endpoint that doesn't require authentication
 * Implements session-based tracking to prevent duplicate counts from page refreshes
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, isOwner } = body;

    // Validate required fields
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'userId is required',
      });
    }

    // Don't track views from the portfolio owner themselves
    if (isOwner === true) {
      return {
        success: false,
        message: 'Owner views are not tracked',
        data: null,
      };
    }

    const supabase = createSupabaseServerClient(event);

    // Generate visitor fingerprint
    const fingerprint = generateVisitorFingerprint(event);

    // Check if this fingerprint has viewed this portfolio in the last 30 minutes
    // This prevents counting multiple views from the same user refreshing the page
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: recentView } = await supabase
      .from('portfolio_views')
      .select('id, session_id')
      .eq('user_id', userId)
      .eq('visitor_fingerprint', fingerprint)
      .gte('viewed_at', thirtyMinutesAgo)
      .order('viewed_at', { ascending: false })
      .limit(1)
      .single();

    // If there's a recent view from this fingerprint, don't count it again
    if (recentView) {
      // Get current analytics to return
      const { data: analytics } = await supabase
        .from('portfolio_analytics')
        .select('total_views, unique_visitors')
        .eq('user_id', userId)
        .single();

      return {
        success: false,
        message: 'View already counted in this session',
        data: {
          total_views: analytics?.total_views || 0,
          unique_visitors: analytics?.unique_visitors || 0,
        },
      };
    }

    // Generate a new session ID for this view
    const sessionId = generateSessionId();

    // Record the new view
    const { error: insertError } = await supabase.from('portfolio_views').insert({
      user_id: userId,
      visitor_fingerprint: fingerprint,
      session_id: sessionId,
      viewed_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error recording view:', insertError);
      throw createError({
        statusCode: 500,
        message: 'Failed to record view',
      });
    }

    // Get updated analytics (the trigger will have updated this)
    const { data: analytics, error: analyticsError } = await supabase
      .from('portfolio_analytics')
      .select('total_views, unique_visitors')
      .eq('user_id', userId)
      .single();

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    }

    return {
      success: true,
      message: 'View recorded successfully',
      data: {
        total_views: analytics?.total_views || 1,
        unique_visitors: analytics?.unique_visitors || 1,
      },
    };
  } catch (error: any) {
    console.error('Error in portfolio-view tracking:', error);

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
