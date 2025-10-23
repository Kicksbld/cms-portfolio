import { createError } from 'h3';
import type { H3Event } from 'h3';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier (IP address)
 */
function getClientId(event: H3Event): string {
  const forwardedFor = event.node.req.headers['x-forwarded-for'];
  const ip = forwardedFor
    ? (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0])
    : event.node.req.socket.remoteAddress || 'unknown';

  return ip;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  maxRequests: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
  identifier?: string; // Optional custom identifier (default: IP address)
}

/**
 * Rate limit middleware
 * @param event - H3 event
 * @param options - Rate limit configuration
 * @throws createError with 429 status code if rate limit exceeded
 */
export function rateLimit(event: H3Event, options: RateLimitOptions): void {
  const { maxRequests, windowMs, identifier } = options;
  const clientId = identifier || getClientId(event);
  const key = `${event.path}:${clientId}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return;
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    throw createError({
      statusCode: 429,
      message: `Trop de tentatives. Veuillez réessayer dans ${resetIn} secondes.`,
    });
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Login rate limiter: 5 attempts per 15 minutes
   */
  login: (event: H3Event) =>
    rateLimit(event, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    }),

  /**
   * Registration rate limiter: 3 attempts per hour
   */
  register: (event: H3Event) =>
    rateLimit(event, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    }),

  /**
   * API rate limiter: 100 requests per minute
   */
  api: (event: H3Event) =>
    rateLimit(event, {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    }),
};
