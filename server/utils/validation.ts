import { createError } from 'h3';

/**
 * Email validation using RFC 5322 simplified regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength validation
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * URL validation - prevents javascript: and data: protocols
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .slice(0, 5000); // Limit length to prevent DoS
}

/**
 * Validate and sanitize display name
 */
export function validateDisplayName(name: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeString(name);

  if (sanitized.length < 2) {
    return {
      isValid: false,
      sanitized,
      error: 'Display name must be at least 2 characters long',
    };
  }

  if (sanitized.length > 100) {
    return {
      isValid: false,
      sanitized,
      error: 'Display name must be less than 100 characters',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }
}

/**
 * Validate project title
 */
export function validateProjectTitle(title: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeString(title);

  if (sanitized.length < 1) {
    return {
      isValid: false,
      sanitized,
      error: 'Project title is required',
    };
  }

  if (sanitized.length > 200) {
    return {
      isValid: false,
      sanitized,
      error: 'Project title must be less than 200 characters',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate project description
 */
export function validateDescription(description: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeString(description);

  if (sanitized.length > 5000) {
    return {
      isValid: false,
      sanitized,
      error: 'Description must be less than 5000 characters',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}
