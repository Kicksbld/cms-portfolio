# Portfolio Analytics Implementation

> **Complete documentation for the portfolio view tracking system**

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Portfolio Analytics system tracks portfolio page views with smart duplicate prevention, privacy-first visitor identification, and real-time statistics. It provides portfolio owners with insights into how many people are viewing their work.

### Key Features

✅ **Smart Duplicate Prevention**
- 30-minute session window prevents counting refreshes as new views
- Fingerprint-based visitor identification
- Automatic owner visit exclusion

✅ **Privacy-First Design**
- IP addresses are hashed using SHA-256 (never stored in plain text)
- GDPR-compliant minimal data collection
- No personally identifiable information (PII) stored

✅ **Performance Optimized**
- Database triggers for automatic aggregate updates
- Indexed columns for fast queries
- Minimal API overhead

✅ **Secure & Scalable**
- Row Level Security (RLS) policies
- Separate public/protected endpoints
- Built on Supabase infrastructure

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Visits Portfolio                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (portfolio/[userId]/index.vue)                     │
│  - Checks if user is portfolio owner                         │
│  - Calls trackView() after 1-second delay                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Analytics Store (stores/analytics.ts)                       │
│  - Sends POST to /api/tracking/portfolio-view               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Tracking API (server/api/tracking/portfolio-view.post.ts)  │
│  1. Generate visitor fingerprint (IP + User Agent hash)      │
│  2. Check for recent view (last 30 minutes)                  │
│  3. If new session → Record view in database                 │
│  4. Return updated analytics                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Database (Supabase)                                         │
│  - Insert into portfolio_views                               │
│  - Trigger auto-updates portfolio_analytics                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Dashboard (pages/dashboard/index.vue)                       │
│  - Fetches analytics on mount                                │
│  - Displays formatted view count                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables

#### 1. `portfolio_views`
Stores individual view records with session tracking.

| Column               | Type                     | Description                                    |
|----------------------|--------------------------|------------------------------------------------|
| `id`                 | UUID (PK)                | Unique view identifier                         |
| `user_id`            | UUID (FK)                | Portfolio owner's user ID                      |
| `visitor_fingerprint`| TEXT                     | SHA-256 hash of IP + User Agent                |
| `session_id`         | UUID                     | Unique session identifier                      |
| `viewed_at`          | TIMESTAMP WITH TIME ZONE | When the view occurred                         |
| `created_at`         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                      |

**Indexes:**
- `idx_portfolio_views_user_id` - Fast lookups by user
- `idx_portfolio_views_fingerprint` - Duplicate detection
- `idx_portfolio_views_session_id` - Session tracking
- `idx_portfolio_views_viewed_at` - Time-based queries

#### 2. `portfolio_analytics`
Stores aggregated analytics per user (auto-updated by trigger).

| Column              | Type                     | Description                                    |
|---------------------|--------------------------|------------------------------------------------|
| `user_id`           | UUID (PK, FK)            | Portfolio owner's user ID                      |
| `total_views`       | INTEGER                  | Total number of views                          |
| `unique_visitors`   | INTEGER                  | Count of unique visitor fingerprints           |
| `last_viewed_at`    | TIMESTAMP WITH TIME ZONE | Most recent view timestamp                     |
| `created_at`        | TIMESTAMP WITH TIME ZONE | Record creation timestamp                      |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | Last update timestamp                          |

### Database Trigger

**Function:** `update_portfolio_analytics()`

Automatically updates the `portfolio_analytics` table whenever a new row is inserted into `portfolio_views`.

**Logic:**
1. Increments `total_views` by 1
2. Recalculates `unique_visitors` (COUNT DISTINCT fingerprints)
3. Updates `last_viewed_at` and `updated_at` timestamps
4. Creates initial record if user doesn't have analytics yet

### Row Level Security (RLS) Policies

#### `portfolio_views`

| Policy Name                          | Operation | Who          | Rule                             |
|--------------------------------------|-----------|--------------|----------------------------------|
| Allow public insert for tracking     | INSERT    | public       | Anyone can insert (for tracking) |
| Users can view their own view records| SELECT    | authenticated| `auth.uid() = user_id`           |

#### `portfolio_analytics`

| Policy Name                          | Operation | Who          | Rule                             |
|--------------------------------------|-----------|--------------|----------------------------------|
| Allow public read of analytics       | SELECT    | public       | Anyone can read (public stats)   |
| Allow service role to manage analytics| ALL       | service_role | Full access for system           |
| Users can view their own analytics   | SELECT    | authenticated| `auth.uid() = user_id`           |

---

## API Endpoints

### 1. Track Portfolio View (Public)

**Endpoint:** `POST /api/tracking/portfolio-view`

**Authentication:** None (public endpoint)

**Purpose:** Records a portfolio view with duplicate prevention

**Request Body:**
```typescript
{
  userId: string;      // Portfolio owner's user ID
  isOwner?: boolean;   // Optional: true if viewer is the owner
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    total_views: number;
    unique_visitors: number;
  } | null;
}
```

**Scenarios:**

1. **New View (Success)**
   ```json
   {
     "success": true,
     "message": "View recorded successfully",
     "data": {
       "total_views": 42,
       "unique_visitors": 28
     }
   }
   ```

2. **Duplicate View (Within 30 minutes)**
   ```json
   {
     "success": false,
     "message": "View already counted in this session",
     "data": {
       "total_views": 42,
       "unique_visitors": 28
     }
   }
   ```

3. **Owner Viewing Own Portfolio**
   ```json
   {
     "success": false,
     "message": "Owner views are not tracked",
     "data": null
   }
   ```

**Implementation Details:**
- **File:** [server/api/tracking/portfolio-view.post.ts](../server/api/tracking/portfolio-view.post.ts)
- **Fingerprinting:** Uses SHA-256 hash of IP + User Agent
- **Session Window:** 30 minutes (configurable)
- **Error Handling:** Returns 400 for missing userId, 500 for database errors

### 2. Get User Analytics (Protected)

**Endpoint:** `GET /api/analytics`

**Authentication:** Required (JWT token via httpOnly cookies)

**Purpose:** Fetch analytics for the authenticated user's portfolio

**Response:**
```typescript
{
  data: {
    user_id: string;
    total_views: number;
    unique_visitors: number;
    last_viewed_at: string | null;
    created_at: string;
    updated_at: string;
  }
}
```

**Example Response:**
```json
{
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "total_views": 2547,
    "unique_visitors": 1832,
    "last_viewed_at": "2025-10-28T14:30:00.000Z",
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-10-28T14:30:00.000Z"
  }
}
```

**Implementation Details:**
- **File:** [server/api/analytics/index.get.ts](../server/api/analytics/index.get.ts)
- **Auth Guard:** Uses `authGuard()` middleware
- **Auto-Initialize:** Creates analytics record if none exists

---

## Frontend Integration

### Analytics Store

**File:** [app/stores/analytics.ts](../app/stores/analytics.ts)

**State:**
```typescript
{
  analytics: PortfolioAnalytics | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**

#### `fetchAnalytics()`
Fetches analytics for the authenticated user (used in dashboard).

```typescript
const analyticsStore = useAnalyticsStore();
await analyticsStore.fetchAnalytics();
```

#### `trackView(userId, isOwner)`
Tracks a portfolio view (called from public portfolio page).

```typescript
await analyticsStore.trackView('user-id-123', false);
```

**Getters:**

| Getter                    | Returns | Description                              |
|---------------------------|---------|------------------------------------------|
| `totalViews`              | number  | Raw total views count                    |
| `uniqueVisitors`          | number  | Raw unique visitors count                |
| `formattedTotalViews`     | string  | Formatted with commas (e.g., "2,547")    |
| `formattedUniqueVisitors` | string  | Formatted with commas                    |
| `lastViewedAt`            | Date    | Last view timestamp as Date object       |

### Portfolio Page Integration

**File:** [app/pages/portfolio/[userId]/index.vue](../app/pages/portfolio/[userId]/index.vue)

**Implementation:**
```vue
<script setup lang="ts">
import { useAnalyticsStore } from "~/stores/analytics";

const analyticsStore = useAnalyticsStore();
const userId = route.params.userId as string;

// Track view once per page load
const hasTrackedView = ref(false);

const trackPortfolioView = async () => {
  if (hasTrackedView.value) return;
  hasTrackedView.value = true;
  await analyticsStore.trackView(userId, isOwnPortfolio.value);
};

onMounted(async () => {
  // ... fetch other data

  // Track view after 1-second delay
  setTimeout(() => {
    trackPortfolioView();
  }, 1000);
});
</script>
```

**Why 1-second delay?**
- Prevents tracking bots that don't fully execute JavaScript
- Ensures page has loaded before tracking
- Better user experience (non-blocking)

### Dashboard Integration

**File:** [app/pages/dashboard/index.vue](../app/pages/dashboard/index.vue)

**Implementation:**
```vue
<script setup lang="ts">
import { useAnalyticsStore } from "~/stores/analytics";

const analyticsStore = useAnalyticsStore();

const analytics = computed(() => ({
  totalViews: analyticsStore.formattedTotalViews || "0",
  projectsCount: projectsStore.projects.length,
  experiencesCount: experiencesStore.experiences.length,
  skillsCount: 0,
}));

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    experiencesStore.fetchExperiences(),
    analyticsStore.fetchAnalytics(), // Fetch analytics
  ]);
});
</script>

<template>
  <StatsCard
    icon="👁️"
    label="Total Views"
    :value="analytics.totalViews"
  />
</template>
```

---

## Setup & Installation

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of [database/migrations/001_create_analytics_tables.sql](../database/migrations/001_create_analytics_tables.sql)
4. Paste into SQL Editor
5. Click **Run** (or press `Cmd/Ctrl + Enter`)

**Verify migration success:**
```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('portfolio_views', 'portfolio_analytics');

-- Should return both table names
```

### Step 2: Verify RLS Policies

```sql
-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('portfolio_views', 'portfolio_analytics');
```

You should see policies for both tables.

### Step 3: Test the Implementation

#### A. Test View Tracking (Frontend)

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Open a portfolio page in incognito mode (not logged in as owner):
   ```
   http://localhost:3000/portfolio/[userId]
   ```

3. Wait 1 second for tracking to fire

4. Check browser console for any errors

5. Verify in Supabase:
   ```sql
   SELECT * FROM portfolio_views ORDER BY viewed_at DESC LIMIT 10;
   SELECT * FROM portfolio_analytics;
   ```

#### B. Test Duplicate Prevention

1. Refresh the portfolio page immediately
2. Check that `total_views` did NOT increase:
   ```sql
   SELECT total_views FROM portfolio_analytics WHERE user_id = '[userId]';
   ```

3. Wait 31 minutes and refresh again
4. Views should now increment

#### C. Test Dashboard Display

1. Log in to the dashboard
2. Navigate to dashboard home
3. Verify "Total Views" card shows the correct number
4. Number should match database:
   ```sql
   SELECT total_views FROM portfolio_analytics WHERE user_id = auth.uid();
   ```

### Step 4: Verify Environment Variables

Ensure your `.env` file has:
```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Usage Guide

### For Developers

#### Adding View Tracking to a New Page

```typescript
// 1. Import the analytics store
import { useAnalyticsStore } from "~/stores/analytics";

// 2. Initialize store
const analyticsStore = useAnalyticsStore();

// 3. Track view on mount
onMounted(() => {
  setTimeout(async () => {
    await analyticsStore.trackView(portfolioOwnerId, false);
  }, 1000);
});
```

#### Fetching Analytics in Components

```typescript
// Option 1: Use the store
const analyticsStore = useAnalyticsStore();
await analyticsStore.fetchAnalytics();
const views = analyticsStore.totalViews;

// Option 2: Direct API call
const { data } = await $fetch('/api/analytics');
console.log(data.total_views);
```

#### Customizing Session Window

Edit [server/api/tracking/portfolio-view.post.ts:29](../server/api/tracking/portfolio-view.post.ts#L29):

```typescript
// Change from 30 minutes to 60 minutes
const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
```

### For Portfolio Owners

#### Viewing Your Analytics

1. Log in to your dashboard
2. Navigate to the home page
3. View the "Total Views" card in the analytics section
4. The number updates automatically when the page loads

#### Understanding the Metrics

- **Total Views:** All-time count of portfolio page visits (excluding your own)
- **Unique Visitors:** Count of different visitors based on fingerprints
- **Ratio:** `total_views / unique_visitors` indicates how often visitors return

**Example:**
- Total Views: 2,547
- Unique Visitors: 1,832
- **Interpretation:** On average, each visitor viewed your portfolio ~1.4 times

---

## Best Practices

### 1. Privacy & GDPR Compliance

✅ **DO:**
- Use hashed fingerprints (already implemented)
- Include analytics disclosure in privacy policy
- Provide opt-out mechanism if required by jurisdiction
- Regularly clean old view records (e.g., after 90 days)

❌ **DON'T:**
- Store raw IP addresses
- Track identifiable user information without consent
- Share analytics data with third parties

### 2. Performance Optimization

✅ **DO:**
- Use the existing indexes on `portfolio_views`
- Rely on database triggers for aggregate updates
- Cache analytics in the Pinia store
- Use the 1-second delay before tracking

❌ **DON'T:**
- Query `portfolio_views` directly for counts (use `portfolio_analytics`)
- Track views on every component mount (use `hasTrackedView` flag)
- Make synchronous blocking calls to tracking API

### 3. Security

✅ **DO:**
- Keep tracking endpoint public (no auth)
- Protect analytics endpoint with `authGuard`
- Validate userId before recording views
- Use RLS policies in Supabase

❌ **DON'T:**
- Allow users to track views for other users' portfolios without validation
- Expose analytics data publicly without RLS
- Skip error handling in tracking calls

### 4. Data Cleanup

Consider adding a cleanup job to remove old view records:

```sql
-- Delete views older than 90 days
DELETE FROM portfolio_views
WHERE viewed_at < NOW() - INTERVAL '90 days';

-- Note: This won't affect portfolio_analytics (aggregates are preserved)
```

**Schedule this as a Supabase Edge Function or cron job.**

---

## Troubleshooting

### Issue 1: Views Not Being Tracked

**Symptoms:**
- Portfolio page loads but view count doesn't increase
- No errors in console

**Debugging Steps:**

1. **Check if tracking is being called:**
   ```typescript
   // Add console log in portfolio page
   const trackPortfolioView = async () => {
     console.log('Tracking view for userId:', userId);
     // ... rest of function
   };
   ```

2. **Verify API response:**
   ```typescript
   const response = await analyticsStore.trackView(userId, isOwnPortfolio.value);
   console.log('Track view response:', response);
   ```

3. **Check if you're the owner:**
   - Tracking is disabled when `isOwner = true`
   - Log out or use incognito mode

4. **Check database:**
   ```sql
   SELECT * FROM portfolio_views
   WHERE user_id = '[userId]'
   ORDER BY viewed_at DESC
   LIMIT 5;
   ```

**Common Causes:**
- Viewing your own portfolio (owner exclusion)
- Refreshing within 30-minute window
- Database migration not run

### Issue 2: 401 Unauthorized on /api/analytics

**Symptoms:**
- Dashboard shows 0 views or error
- Console shows 401 error

**Debugging Steps:**

1. **Check authentication:**
   ```typescript
   const authStore = useAuthStore();
   console.log('User:', authStore.user);
   ```

2. **Verify cookies:**
   - Open DevTools → Application → Cookies
   - Check for `sb-access-token` and `sb-refresh-token`

3. **Check auth guard:**
   ```bash
   # Server logs should show authentication flow
   npm run dev
   ```

**Solution:**
- Log out and log back in
- Clear cookies and re-authenticate

### Issue 3: Total Views Incrementing on Every Refresh

**Symptoms:**
- Views increase even when refreshing quickly
- Session window not working

**Debugging Steps:**

1. **Check fingerprint generation:**
   ```sql
   SELECT visitor_fingerprint, COUNT(*)
   FROM portfolio_views
   WHERE user_id = '[userId]'
   GROUP BY visitor_fingerprint;
   ```

2. **Verify session window query:**
   ```sql
   SELECT * FROM portfolio_views
   WHERE user_id = '[userId]'
   AND visitor_fingerprint = '[fingerprint]'
   AND viewed_at >= NOW() - INTERVAL '30 minutes';
   ```

**Common Causes:**
- IP address changing between requests (VPN/proxy)
- User Agent changing (browser extensions)
- Database time zone mismatch

**Solution:**
- Verify `viewed_at` uses `TIMESTAMP WITH TIME ZONE`
- Check server time zone configuration

### Issue 4: Analytics Not Updating

**Symptoms:**
- New views in `portfolio_views` but `portfolio_analytics` not updating

**Debugging Steps:**

1. **Check if trigger exists:**
   ```sql
   SELECT tgname, tgenabled
   FROM pg_trigger
   WHERE tgname = 'trigger_update_portfolio_analytics';
   ```

2. **Test trigger manually:**
   ```sql
   -- Insert a test view
   INSERT INTO portfolio_views (user_id, visitor_fingerprint, session_id)
   VALUES ('[userId]', 'test-fingerprint', gen_random_uuid());

   -- Check if analytics updated
   SELECT * FROM portfolio_analytics WHERE user_id = '[userId]';
   ```

**Solution:**
- Re-run the database migration
- Verify trigger function exists and is enabled

### Issue 5: High Database Load

**Symptoms:**
- Slow page loads
- Timeout errors

**Debugging Steps:**

1. **Check query performance:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM portfolio_views
   WHERE user_id = '[userId]'
   AND visitor_fingerprint = '[fingerprint]'
   AND viewed_at >= NOW() - INTERVAL '30 minutes';
   ```

2. **Verify indexes:**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'portfolio_views';
   ```

**Solution:**
- Ensure all indexes are created (check migration)
- Consider partitioning `portfolio_views` by date if volume is very high
- Add cleanup job to archive old views

---

## Future Enhancements

### 1. Advanced Analytics Dashboard

**Features to add:**
- View trends over time (daily/weekly/monthly charts)
- Geographic distribution (requires storing country codes)
- Referrer tracking (where visitors came from)
- Device type breakdown (mobile/desktop/tablet)
- Peak viewing times

**Implementation:**
```typescript
// Additional columns in portfolio_views
ALTER TABLE portfolio_views ADD COLUMN device_type TEXT;
ALTER TABLE portfolio_views ADD COLUMN referrer TEXT;
ALTER TABLE portfolio_views ADD COLUMN country_code TEXT;
```

### 2. Real-Time View Notifications

**Features:**
- WebSocket connection for live view updates
- Push notifications when someone views your portfolio
- "Currently viewing" indicator

**Implementation:**
```typescript
// Use Supabase Realtime
const channel = supabase
  .channel('portfolio-views')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'portfolio_views',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update UI in real-time
    analyticsStore.incrementViews();
  })
  .subscribe();
```

### 3. Project-Level Analytics

**Features:**
- Track views per project (not just portfolio)
- Most viewed projects ranking
- Conversion tracking (views → clicks → external links)

**Implementation:**
```sql
-- New table
CREATE TABLE project_views (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES project(id),
  visitor_fingerprint TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE
);
```

### 4. Visitor Journey Tracking

**Features:**
- Track which pages visitors view in sequence
- Time spent on each section
- Scroll depth tracking

**Implementation:**
```typescript
// Track page events
const trackPageEvent = async (eventType: string, metadata: object) => {
  await $fetch('/api/tracking/page-event', {
    method: 'POST',
    body: { eventType, metadata, sessionId }
  });
};
```

### 5. A/B Testing Support

**Features:**
- Test different portfolio layouts
- Compare view metrics between variants
- Statistical significance calculations

**Implementation:**
```sql
ALTER TABLE portfolio_views ADD COLUMN variant TEXT;
```

### 6. Export Analytics

**Features:**
- CSV/JSON export of view data
- PDF reports
- Email weekly summaries

**Implementation:**
```typescript
// API endpoint
export default defineEventHandler(async (event) => {
  const user = await authGuard(event);
  const format = getQuery(event).format; // 'csv' | 'json'

  const { data } = await supabase
    .from('portfolio_views')
    .select('*')
    .eq('user_id', user.id);

  if (format === 'csv') {
    return generateCSV(data);
  }
  return data;
});
```

### 7. Bot Detection

**Features:**
- Identify and filter bot traffic
- Separate human vs bot analytics
- Block known bot user agents

**Implementation:**
```typescript
// In fingerprint.ts
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /scrape/i
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
}
```

---

## References

### Related Files

| File | Purpose |
|------|---------|
| [database/migrations/001_create_analytics_tables.sql](../database/migrations/001_create_analytics_tables.sql) | Database schema and RLS policies |
| [server/utils/fingerprint.ts](../server/utils/fingerprint.ts) | Visitor fingerprinting utilities |
| [server/api/tracking/portfolio-view.post.ts](../server/api/tracking/portfolio-view.post.ts) | View tracking endpoint |
| [server/api/analytics/index.get.ts](../server/api/analytics/index.get.ts) | Analytics fetch endpoint |
| [app/stores/analytics.ts](../app/stores/analytics.ts) | Pinia store for analytics |
| [app/types/analytics.ts](../app/types/analytics.ts) | TypeScript type definitions |
| [app/pages/portfolio/[userId]/index.vue](../app/pages/portfolio/[userId]/index.vue) | Portfolio page with tracking |
| [app/pages/dashboard/index.vue](../app/pages/dashboard/index.vue) | Dashboard with analytics display |

### External Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Pinia Store Guide](https://pinia.vuejs.org/)
- [GDPR Compliance Guide](https://gdpr.eu/)

---

## Support & Contributing

### Getting Help

- Check [Troubleshooting](#troubleshooting) section first
- Review Supabase logs in dashboard
- Check browser console for errors
- Verify database migration ran successfully

### Contributing

When adding features to this analytics system:

1. Update this documentation
2. Add TypeScript types to [app/types/analytics.ts](../app/types/analytics.ts)
3. Write database migrations (don't modify tables directly)
4. Add RLS policies for new tables
5. Test with different user roles (owner, visitor, anonymous)

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Maintainer:** Canvasly Team
