import crypto from 'crypto';
import type { H3Event } from 'h3';

/**
 * Generates a privacy-preserving fingerprint for visitor identification
 * Uses a combination of IP address and User Agent to create a unique hash
 * This prevents storing PII while still allowing duplicate detection
 */
export function generateVisitorFingerprint(event: H3Event): string {
  // Get IP address (handle proxies)
  const ip =
    event.node.req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    event.node.req.headers['x-real-ip']?.toString() ||
    event.node.req.socket.remoteAddress ||
    'unknown';

  // Get User Agent
  const userAgent = event.node.req.headers['user-agent'] || 'unknown';

  // Create a hash from IP + User Agent for privacy
  // This way we don't store raw IP addresses
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex');

  return fingerprint;
}

/**
 * Generates a unique session ID using UUID v4
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Extracts visitor information for logging/debugging (without storing)
 */
export function getVisitorInfo(event: H3Event): {
  ip: string;
  userAgent: string;
  referrer?: string;
} {
  const ip =
    event.node.req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    event.node.req.headers['x-real-ip']?.toString() ||
    event.node.req.socket.remoteAddress ||
    'unknown';

  const userAgent = event.node.req.headers['user-agent'] || 'unknown';
  const referrer = event.node.req.headers['referer'] || event.node.req.headers['referrer'];

  return {
    ip,
    userAgent,
    referrer: referrer?.toString(),
  };
}
