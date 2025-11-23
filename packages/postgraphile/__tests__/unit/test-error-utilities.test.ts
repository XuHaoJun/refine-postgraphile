import { describe, it, expect } from "vitest";
import {
  PostGraphileError,
  ErrorCodes,
  handleGraphQLError,
  handleSingleGraphQLError,
  handleDatabaseError,
  isRetryableError,
  getUserFriendlyErrorMessage,
} from "../../src/utils/errors";

describe("PostGraphileError", () => {
  it("should create error with correct properties", () => {
    const error = new PostGraphileError(
      "Test error message",
      ErrorCodes.INVALID_CONFIGURATION,
      { field: "endpoint" },
      new Error("Original error")
    );

    expect(error.message).toBe("Test error message");
    expect(error.code).toBe(ErrorCodes.INVALID_CONFIGURATION);
    expect(error.details).toEqual({ field: "endpoint" });
    expect(error.originalError).toBeInstanceOf(Error);
    expect(error.name).toBe("PostGraphileError");
  });
});

describe("handleGraphQLError", () => {
  it("should handle GraphQL validation errors", () => {
    const graphqlError = {
      response: {
        errors: [
          {
            message: "GraphQL validation failed",
          },
        ],
      },
    };

    const result = handleGraphQLError(graphqlError);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.GRAPHQL_VALIDATION);
  });

  it("should handle network errors", () => {
    const networkError = new Error("Network request failed");

    const result = handleGraphQLError(networkError);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
  });
});

describe("handleSingleGraphQLError", () => {
  it("should handle validation errors", () => {
    const error = {
      message: "GraphQL validation failed",
    };

    const result = handleSingleGraphQLError(error);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.GRAPHQL_VALIDATION);
  });

  it("should handle database constraint errors", () => {
    const error = {
      message: "duplicate key value violates unique constraint",
      extensions: { code: "23505" },
    };

    const result = handleSingleGraphQLError(error);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.UNIQUE_CONSTRAINT);
  });
});

describe("handleDatabaseError", () => {
  it("should handle PostgreSQL unique constraint violations", () => {
    const message = "duplicate key value violates unique constraint";
    const extensions = { code: "23505" };

    const result = handleDatabaseError(message, extensions);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.UNIQUE_CONSTRAINT);
  });

  it("should handle foreign key constraint violations", () => {
    const message = "violates foreign key constraint";
    const extensions = { code: "23503" };

    const result = handleDatabaseError(message, extensions);

    expect(result).toBeInstanceOf(PostGraphileError);
    expect(result.code).toBe(ErrorCodes.FOREIGN_KEY_CONSTRAINT);
  });
});

describe("isRetryableError", () => {
  it("should identify network errors as retryable", () => {
    const error = new PostGraphileError("Network error", ErrorCodes.GRAPHQL_NETWORK);

    expect(isRetryableError(error)).toBe(true);
  });

  it("should identify timeout errors as retryable", () => {
    const error = new PostGraphileError("Timeout", ErrorCodes.ENDPOINT_UNAVAILABLE);

    expect(isRetryableError(error)).toBe(true);
  });

  it("should not identify validation errors as retryable", () => {
    const error = new PostGraphileError("Validation failed", ErrorCodes.GRAPHQL_VALIDATION);

    expect(isRetryableError(error)).toBe(false);
  });
});

describe("getUserFriendlyErrorMessage", () => {
  it("should provide user-friendly message for unique constraint errors", () => {
    const error = new PostGraphileError("Duplicate entry", ErrorCodes.UNIQUE_CONSTRAINT);

    const message = getUserFriendlyErrorMessage(error);

    expect(message).toContain("already in use");
  });

  it("should provide user-friendly message for foreign key errors", () => {
    const error = new PostGraphileError("Foreign key violation", ErrorCodes.FOREIGN_KEY_CONSTRAINT);

    const message = getUserFriendlyErrorMessage(error);

    expect(message).toContain("being used elsewhere");
  });

  it("should return original message for unknown errors", () => {
    const error = new PostGraphileError("Unknown error", "UNKNOWN_CODE");

    const message = getUserFriendlyErrorMessage(error);

    expect(message).toBe("Unknown error");
  });
});
