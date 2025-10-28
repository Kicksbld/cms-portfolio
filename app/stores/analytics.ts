import { defineStore } from 'pinia';
import type { PortfolioAnalytics } from '~/types/analytics';

interface AnalyticsState {
  analytics: PortfolioAnalytics | null;
  loading: boolean;
  error: string | null;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    analytics: null,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get total portfolio views
     */
    totalViews: (state): number => {
      return state.analytics?.total_views || 0;
    },

    /**
     * Get unique visitors count
     */
    uniqueVisitors: (state): number => {
      return state.analytics?.unique_visitors || 0;
    },

    /**
     * Get formatted total views (e.g., "1,234")
     */
    formattedTotalViews: (state): string => {
      const views = state.analytics?.total_views || 0;
      return views.toLocaleString();
    },

    /**
     * Get formatted unique visitors
     */
    formattedUniqueVisitors: (state): string => {
      const visitors = state.analytics?.unique_visitors || 0;
      return visitors.toLocaleString();
    },

    /**
     * Get last viewed date
     */
    lastViewedAt: (state): Date | null => {
      if (!state.analytics?.last_viewed_at) return null;
      return new Date(state.analytics.last_viewed_at);
    },
  },

  actions: {
    /**
     * Fetch analytics for the authenticated user
     */
    async fetchAnalytics() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await $fetch('/api/analytics', {
          method: 'GET',
        });

        this.analytics = data as PortfolioAnalytics;
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        this.error = err.message || 'Failed to fetch analytics';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Track a portfolio view (called from public portfolio page)
     * @param userId - The ID of the portfolio owner
     * @param isOwner - Whether the current viewer is the portfolio owner
     */
    async trackView(userId: string, isOwner: boolean = false) {
      try {
        const response = await $fetch('/api/tracking/portfolio-view', {
          method: 'POST',
          body: {
            userId,
            isOwner,
          },
        });

        return response;
      } catch (err: any) {
        console.error('Failed to track view:', err);
        // Don't throw error - tracking should fail silently
        return null;
      }
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reset store state
     */
    reset() {
      this.analytics = null;
      this.loading = false;
      this.error = null;
    },
  },
});
