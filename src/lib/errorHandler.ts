/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

export type AppError = {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  userMessage?: string; // User-friendly message
};

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHZ_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Create a standardized error object
 */
export function createError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  details?: unknown
): AppError {
  return {
    message,
    code: type,
    details,
    userMessage: getUserFriendlyMessage(message, type),
  };
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(message: string, type: ErrorType): string {
  // Don't expose internal error messages to users
  const internalErrorPatterns = [
    /ECONNREFUSED/,
    /ENOTFOUND/,
    /ETIMEDOUT/,
    /database/,
    /sql/,
    /query/,
  ];

  // Check if message contains internal details
  if (internalErrorPatterns.some((pattern) => pattern.test(message.toLowerCase()))) {
    return getDefaultUserMessage(type);
  }

  // If message is already user-friendly, return it
  if (message.length < 100 && !message.includes('Error:') && !message.includes('at ')) {
    return message;
  }

  return getDefaultUserMessage(type);
}

/**
 * Get default user-friendly message based on error type
 */
function getDefaultUserMessage(type: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Проблем с връзката. Моля, проверете интернет връзката си и опитайте отново.',
    [ErrorType.AUTHENTICATION]: 'Не сте влезли в системата. Моля, влезте отново.',
    [ErrorType.AUTHORIZATION]: 'Нямате права за това действие.',
    [ErrorType.VALIDATION]: 'Моля, проверете въведените данни.',
    [ErrorType.NOT_FOUND]: 'Заявеният ресурс не е намерен.',
    [ErrorType.SERVER]: 'Възникна проблем със сървъра. Моля, опитайте по-късно.',
    [ErrorType.UNKNOWN]: 'Възникна неочаквана грешка. Моля, опитайте отново.',
  };

  return messages[type] || messages[ErrorType.UNKNOWN];
}

/**
 * Handle API errors
 */
export async function handleApiError(response: Response): Promise<AppError> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  let errorType = ErrorType.SERVER;

  // Determine error type based on status code
  if (response.status === 401) {
    errorType = ErrorType.AUTHENTICATION;
  } else if (response.status === 403) {
    errorType = ErrorType.AUTHORIZATION;
  } else if (response.status === 404) {
    errorType = ErrorType.NOT_FOUND;
  } else if (response.status === 422) {
    errorType = ErrorType.VALIDATION;
  } else if (response.status >= 500) {
    errorType = ErrorType.SERVER;
  } else if (response.status === 0 || response.status >= 400) {
    errorType = ErrorType.NETWORK;
  }

  // Try to extract error message from response
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
      
      // Handle Laravel validation errors
      if (data.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0] as string[] | string;
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
        errorType = ErrorType.VALIDATION;
      }
    } else {
      const text = await response.text();
      if (text && text.length < 200) {
        errorMessage = text;
      }
    }
  } catch {
    // If parsing fails, use default message
  }

  return createError(errorMessage, errorType, {
    statusCode: response.status,
    statusText: response.statusText,
  });
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createError(
      'Не може да се свърже със сървъра',
      ErrorType.NETWORK,
      error
    );
  }

  if (error instanceof Error) {
    return createError(error.message, ErrorType.NETWORK, error);
  }

  return createError('Възникна мрежова грешка', ErrorType.NETWORK, error);
}

/**
 * Log error (for development and error tracking services)
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', {
      ...error,
      context,
    });
  }

  // In production, send to error tracking service
  // TODO: Integrate with Sentry or similar
  // if (window.Sentry && process.env.NODE_ENV === 'production') {
  //   window.Sentry.captureException(new Error(error.message), {
  //     tags: { errorCode: error.code },
  //     extra: { ...error, context },
  //   });
  // }
}

/**
 * Safe error handler wrapper for async functions
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorType: ErrorType = ErrorType.UNKNOWN
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = error instanceof Error
        ? createError(error.message, errorType, error)
        : createError('Unknown error occurred', errorType, error);
      
      logError(appError);
      throw appError;
    }
  };
}

