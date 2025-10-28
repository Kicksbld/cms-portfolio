-- Portfolio Analytics Tables
-- Run this migration in your Supabase SQL Editor

-- Table to store individual portfolio view records
CREATE TABLE IF NOT EXISTS portfolio_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_fingerprint TEXT NOT NULL,
  session_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store aggregated analytics per user
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0 NOT NULL,
  unique_visitors INTEGER DEFAULT 0 NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_views_user_id ON portfolio_views(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_fingerprint ON portfolio_views(visitor_fingerprint);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_session_id ON portfolio_views(session_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_viewed_at ON portfolio_views(viewed_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- portfolio_views policies
-- Allow anyone to insert (for tracking)
CREATE POLICY "Allow public insert for tracking"
  ON portfolio_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own analytics
CREATE POLICY "Users can view their own view records"
  ON portfolio_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- portfolio_analytics policies
-- Allow anyone to read analytics (public portfolios)
CREATE POLICY "Allow public read of analytics"
  ON portfolio_analytics
  FOR SELECT
  TO public
  USING (true);

-- Allow system to insert/update analytics
CREATE POLICY "Allow service role to manage analytics"
  ON portfolio_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON portfolio_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update analytics aggregates
CREATE OR REPLACE FUNCTION update_portfolio_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert the analytics record
  INSERT INTO portfolio_analytics (user_id, total_views, unique_visitors, last_viewed_at, updated_at)
  VALUES (
    NEW.user_id,
    1,
    1,
    NEW.viewed_at,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_views = portfolio_analytics.total_views + 1,
    unique_visitors = (
      SELECT COUNT(DISTINCT visitor_fingerprint)
      FROM portfolio_views
      WHERE user_id = NEW.user_id
    ),
    last_viewed_at = NEW.viewed_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update analytics when a new view is recorded
CREATE TRIGGER trigger_update_portfolio_analytics
  AFTER INSERT ON portfolio_views
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_analytics();

-- Initialize analytics for existing users
INSERT INTO portfolio_analytics (user_id, total_views, unique_visitors)
SELECT id, 0, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM portfolio_analytics)
ON CONFLICT (user_id) DO NOTHING;
