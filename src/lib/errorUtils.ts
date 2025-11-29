/**
 * Error Utilities
 * Helper functions for extracting user-friendly error messages from API errors
 */

import type { AppError } from './errorHandler';

/**
 * Extract user-friendly error message from an error object
 * 
 * This function handles:
 * - AppError objects (from errorHandler) - returns userMessage
 * - Error objects - returns message if user-friendly, otherwise default
 * - Unknown error types - returns default message
 * 
 * @param error - The error object (can be AppError, Error, or unknown)
 * @param defaultMessage - Default message if error cannot be parsed (default: "Възникна неочаквана грешка")
 * @returns User-friendly error message
 */
export function getUserErrorMessage(
  error: unknown,
  defaultMessage: string = "Възникна неочаквана грешка"
): string {
  // Handle AppError (from errorHandler)
  if (error && typeof error === 'object' && 'userMessage' in error) {
    const appError = error as AppError;
    if (appError.userMessage && typeof appError.userMessage === 'string') {
      return appError.userMessage;
    }
    // Fallback to message if userMessage is not available
    if (appError.message && typeof appError.message === 'string') {
      return appError.message;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check if message is user-friendly (not a stack trace or technical error)
    if (message && message.length < 200 && !message.includes('at ') && !message.includes('Error:')) {
      // Filter out technical error patterns
      const technicalPatterns = [
        /ECONNREFUSED/i,
        /ENOTFOUND/i,
        /ETIMEDOUT/i,
        /network/i,
        /fetch/i,
        /XMLHttpRequest/i,
        /CORS/i,
        /database/i,
        /sql/i,
        /query/i,
        /stack/i,
        /trace/i,
      ];
      
      if (!technicalPatterns.some(pattern => pattern.test(message))) {
        return message;
      }
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (error.length < 200 && !error.includes('at ')) {
      return error;
    }
  }

  // Return default message for unknown/unparseable errors
  return defaultMessage;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const appError = error as AppError;
    return appError.code === 'AUTH_ERROR' || appError.code === 'AUTHZ_ERROR';
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const appError = error as AppError;
    return appError.code === 'VALIDATION_ERROR';
  }
  return false;
}

