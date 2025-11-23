import type { GraphQLError } from "@/interfaces";

/**
 * Custom error class for PostGraphile data provider errors
 */
export class PostGraphileError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    details?: any,
    originalError?: Error
  ) {
    super(message);
    this.name = "PostGraphileError";
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }
}

/**
 * Error codes for different types of PostGraphile errors
 */
export const ErrorCodes = {
  // GraphQL Errors
  GRAPHQL_VALIDATION: "GRAPHQL_VALIDATION",
  GRAPHQL_EXECUTION: "GRAPHQL_EXECUTION",
  GRAPHQL_NETWORK: "GRAPHQL_NETWORK",

  // Database Errors
  UNIQUE_CONSTRAINT: "UNIQUE_CONSTRAINT",
  FOREIGN_KEY_CONSTRAINT: "FOREIGN_KEY_CONSTRAINT",
  CHECK_CONSTRAINT: "CHECK_CONSTRAINT",
  NOT_NULL_CONSTRAINT: "NOT_NULL_CONSTRAINT",
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // Authentication/Authorization
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  AUTHORIZATION_FAILED: "AUTHORIZATION_FAILED",

  // Configuration
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
  ENDPOINT_UNAVAILABLE: "ENDPOINT_UNAVAILABLE",

  // Data
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  INVALID_DATA: "INVALID_DATA",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Handles errors from GraphQL requests and converts them to PostGraphileError instances
 *
 * @param error - The error from graphql-request
 * @returns PostGraphileError instance
 */
export function handleGraphQLError(error: any): PostGraphileError {
  // Handle graphql-request ClientError
  if (error.response?.errors?.[0]) {
    const gqlError = error.response.errors[0] as GraphQLError;
    return handleSingleGraphQLError(gqlError, error);
  }

  // Handle network errors
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return new PostGraphileError(
      "Unable to connect to PostGraphile endpoint",
      ErrorCodes.ENDPOINT_UNAVAILABLE,
      { endpoint: error.config?.url },
      error
    );
  }

  // Handle timeout errors
  if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
    return new PostGraphileError(
      "Request timed out",
      ErrorCodes.GRAPHQL_NETWORK,
      { timeout: true },
      error
    );
  }

  // Handle other network errors
  if (error.isAxiosError || error.code) {
    return new PostGraphileError(
      error.message || "Network error occurred",
      ErrorCodes.GRAPHQL_NETWORK,
      { code: error.code },
      error
    );
  }

  // Fallback for unknown errors
  return new PostGraphileError(
    error.message || "An unknown error occurred",
    ErrorCodes.UNKNOWN_ERROR,
    undefined,
    error
  );
}

/**
 * Handles a single GraphQL error and determines its type
 *
 * @param gqlError - GraphQL error object
 * @param originalError - Original error for context
 * @returns PostGraphileError instance
 */
export function handleSingleGraphQLError(
  gqlError: GraphQLError,
  originalError?: any
): PostGraphileError {
  const { message, extensions } = gqlError;

  // Check for database constraint errors in extensions
  if (extensions?.code) {
    return handleDatabaseError(message, extensions, originalError);
  }

  // Check for validation errors
  if (message.includes("validation") || message.includes("syntax")) {
    return new PostGraphileError(
      "GraphQL validation error",
      ErrorCodes.GRAPHQL_VALIDATION,
      { graphqlError: gqlError },
      originalError
    );
  }

  // Check for authentication errors
  if (
    message.includes("unauthorized") ||
    message.includes("authentication") ||
    message.includes("jwt")
  ) {
    return new PostGraphileError(
      "Authentication failed",
      ErrorCodes.AUTHENTICATION_FAILED,
      { graphqlError: gqlError },
      originalError
    );
  }

  // Check for permission errors
  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    message.includes("access denied")
  ) {
    return new PostGraphileError(
      "Permission denied",
      ErrorCodes.PERMISSION_DENIED,
      { graphqlError: gqlError },
      originalError
    );
  }

  // Check for "not found" errors
  if (message.includes("not found") || message.includes("does not exist")) {
    return new PostGraphileError(
      "Record not found",
      ErrorCodes.RECORD_NOT_FOUND,
      { graphqlError: gqlError },
      originalError
    );
  }

  // Default to execution error
  return new PostGraphileError(
    message,
    ErrorCodes.GRAPHQL_EXECUTION,
    { graphqlError: gqlError },
    originalError
  );
}

/**
 * Handles database-specific errors from PostGraphile
 *
 * @param message - Error message
 * @param extensions - GraphQL error extensions
 * @param originalError - Original error for context
 * @returns PostGraphileError instance
 */
export function handleDatabaseError(
  message: string,
  extensions: any,
  originalError?: any
): PostGraphileError {
  const code = extensions.code?.toLowerCase();

  // PostgreSQL error codes
  if (code === "23505") {
    // unique_violation
    return new PostGraphileError(
      "A record with this information already exists",
      ErrorCodes.UNIQUE_CONSTRAINT,
      { extensions, constraint: extractConstraintName(message) },
      originalError
    );
  }

  if (code === "23503") {
    // foreign_key_violation
    return new PostGraphileError(
      "This record cannot be deleted because it is referenced by other records",
      ErrorCodes.FOREIGN_KEY_CONSTRAINT,
      { extensions, constraint: extractConstraintName(message) },
      originalError
    );
  }

  if (code === "23502") {
    // not_null_violation
    return new PostGraphileError(
      "Required field is missing",
      ErrorCodes.NOT_NULL_CONSTRAINT,
      { extensions, column: extractColumnName(message) },
      originalError
    );
  }

  if (code === "23514") {
    // check_violation
    return new PostGraphileError(
      "Data validation failed",
      ErrorCodes.CHECK_CONSTRAINT,
      { extensions, constraint: extractConstraintName(message) },
      originalError
    );
  }

  if (code === "42501") {
    // insufficient_privilege
    return new PostGraphileError(
      "Permission denied",
      ErrorCodes.PERMISSION_DENIED,
      { extensions },
      originalError
    );
  }

  // PostGraphile-specific error codes
  if (code === "permission-denied") {
    return new PostGraphileError(
      "Permission denied",
      ErrorCodes.PERMISSION_DENIED,
      { extensions },
      originalError
    );
  }

  // Fallback for unknown database errors
  return new PostGraphileError(
    message,
    ErrorCodes.GRAPHQL_EXECUTION,
    { extensions },
    originalError
  );
}

/**
 * Extracts constraint name from PostgreSQL error message
 *
 * @param message - Error message
 * @returns Constraint name or undefined
 */
function extractConstraintName(message: string): string | undefined {
  const match = message.match(/constraint "([^"]+)"/);
  return match ? match[1] : undefined;
}

/**
 * Extracts column name from PostgreSQL error message
 *
 * @param message - Error message
 * @returns Column name or undefined
 */
function extractColumnName(message: string): string | undefined {
  const match = message.match(/column "([^"]+)"/);
  return match ? match[1] : undefined;
}

/**
 * Checks if an error is retryable
 *
 * @param error - Error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: PostGraphileError): boolean {
  const retryableCodes = [
    ErrorCodes.GRAPHQL_NETWORK,
    ErrorCodes.ENDPOINT_UNAVAILABLE,
  ];

  return retryableCodes.includes(error.code as ErrorCode);
}

/**
 * Gets a user-friendly error message for display
 *
 * @param error - PostGraphileError instance
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: PostGraphileError): string {
  switch (error.code) {
    case ErrorCodes.UNIQUE_CONSTRAINT:
      return "This information is already in use. Please try different values.";

    case ErrorCodes.FOREIGN_KEY_CONSTRAINT:
      return "This item cannot be deleted because it is being used elsewhere.";

    case ErrorCodes.NOT_NULL_CONSTRAINT:
      return "Required information is missing. Please fill in all required fields.";

    case ErrorCodes.CHECK_CONSTRAINT:
      return "The provided information doesn't meet our requirements.";

    case ErrorCodes.PERMISSION_DENIED:
      return "You don't have permission to perform this action.";

    case ErrorCodes.AUTHENTICATION_FAILED:
      return "Please log in to continue.";

    case ErrorCodes.RECORD_NOT_FOUND:
      return "The requested item could not be found.";

    case ErrorCodes.ENDPOINT_UNAVAILABLE:
      return "Service is temporarily unavailable. Please try again later.";

    case ErrorCodes.GRAPHQL_NETWORK:
      return "Network error. Please check your connection and try again.";

    default:
      return error.message || "An unexpected error occurred.";
  }
}

/**
 * Creates a detailed error log entry
 *
 * @param error - PostGraphileError instance
 * @param context - Additional context information
 * @returns Formatted error log entry
 */
export function createErrorLog(
  error: PostGraphileError,
  context?: Record<string, any>
): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    details: error.details,
    originalError: error.originalError?.message,
    context,
  };
}

/**
 * Wraps an async function with error handling
 *
 * @param fn - Function to wrap
 * @param errorHandler - Optional custom error handler
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: any) => PostGraphileError
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const postGraphileError = errorHandler
        ? errorHandler(error)
        : handleGraphQLError(error);
      throw postGraphileError;
    }
  };
}
