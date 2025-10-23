import { createError } from 'h3';
import type { MultiPartData } from 'h3';

/**
 * Allowed MIME types for images
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * File size limits in bytes
 */
export const FILE_SIZE_LIMITS = {
  PROJECT_THUMBNAIL: 5 * 1024 * 1024, // 5MB
  LINK_ICON: 1 * 1024 * 1024, // 1MB
};

/**
 * Magic bytes (file signatures) for common image formats
 */
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38], // GIF
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
  ],
};

/**
 * Check if file signature matches declared MIME type
 */
function verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
  // SVG is XML-based, skip binary signature check
  if (mimeType === 'image/svg+xml') {
    const content = buffer.toString('utf8', 0, Math.min(1000, buffer.length));
    return content.includes('<svg') || content.includes('<?xml');
  }

  const signatures = IMAGE_SIGNATURES[mimeType];
  if (!signatures) {
    return false;
  }

  // Check if file starts with any of the valid signatures
  return signatures.some((signature) => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Validate uploaded file
 */
export function validateFile(
  file: MultiPartData,
  maxSize: number,
  fileType: 'image'
): {
  isValid: boolean;
  error?: string;
} {
  // Check if file exists
  if (!file || !file.data) {
    return {
      isValid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.data.length > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // For images, validate MIME type
  if (fileType === 'image') {
    if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    // Verify file signature matches MIME type (prevents file extension spoofing)
    const buffer = Buffer.from(file.data);
    if (!verifyFileSignature(buffer, file.type)) {
      return {
        isValid: false,
        error: 'File content does not match declared type',
      };
    }
  }

  // Check for suspicious filenames (path traversal attempts)
  if (file.filename && (file.filename.includes('..') || file.filename.includes('/'))) {
    return {
      isValid: false,
      error: 'Invalid filename',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Generate safe random filename
 */
export function generateSafeFilename(userId: string, originalFilename?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  // Get file extension from original filename
  let extension = '';
  if (originalFilename) {
    const parts = originalFilename.split('.');
    if (parts.length > 1) {
      extension = `.${parts[parts.length - 1].toLowerCase()}`;
    }
  }

  // Generate safe filename: userId-timestamp-random.ext
  return `${userId}-${timestamp}-${random}${extension}`;
}

/**
 * Validate image file for project thumbnail
 */
export function validateProjectThumbnail(file: MultiPartData): void {
  const validation = validateFile(file, FILE_SIZE_LIMITS.PROJECT_THUMBNAIL, 'image');

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      message: validation.error || 'Invalid project thumbnail',
    });
  }
}

/**
 * Validate image file for link icon
 */
export function validateLinkIcon(file: MultiPartData): void {
  const validation = validateFile(file, FILE_SIZE_LIMITS.LINK_ICON, 'image');

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      message: validation.error || 'Invalid link icon',
    });
  }
}

/**
 * Sanitize SVG content to prevent XSS
 */
export function sanitizeSVG(buffer: Buffer): Buffer {
  let content = buffer.toString('utf8');

  // Remove script tags and event handlers
  content = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');

  return Buffer.from(content, 'utf8');
}
