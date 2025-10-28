/**
 * Portfolio Analytics Types
 */

export interface PortfolioView {
  id: string;
  user_id: string;
  visitor_fingerprint: string;
  session_id: string;
  viewed_at: string;
  created_at: string;
}

export interface PortfolioAnalytics {
  user_id: string;
  total_views: number;
  unique_visitors: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackViewRequest {
  userId: string;
  isOwner?: boolean;
}

export interface TrackViewResponse {
  success: boolean;
  message: string;
  data: {
    total_views: number;
    unique_visitors: number;
  };
}

export interface AnalyticsState {
  analytics: PortfolioAnalytics | null;
  loading: boolean;
  error: string | null;
}
