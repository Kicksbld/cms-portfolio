/**
 * Security headers middleware
 * Adds security headers to all responses
 */
export default defineEventHandler((event) => {
  const headers = event.node.res;

  // Content Security Policy - Prevents XSS and injection attacks
  headers.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Nuxt requires unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'", // Nuxt requires unsafe-inline for styles
      "img-src 'self' data: https: blob:", // Allow images from https sources
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co", // Supabase API
      "frame-ancestors 'none'", // Prevent clickjacking
    ].join('; ')
  );

  // X-Frame-Options - Prevent clickjacking
  headers.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - Prevent MIME type sniffing
  headers.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - Enable XSS filter (legacy browsers)
  headers.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - Control referrer information
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - Disable unnecessary browser features
  headers.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict-Transport-Security - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
});
