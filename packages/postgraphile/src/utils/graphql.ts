import { GraphQLClient } from "graphql-request";
import type { PostGraphileDataProviderConfig } from "@/interfaces";

/**
 * Creates a configured GraphQL client for PostGraphile
 *
 * @param endpoint - GraphQL endpoint URL
 * @param config - PostGraphile data provider configuration
 * @returns Configured GraphQL client instance
 */
export function createGraphQLClient(endpoint: string, config: PostGraphileDataProviderConfig = {}): GraphQLClient {
  const {
    headers = {},
    timeout = 30000,
    retry,
  } = config;

  if (!endpoint) {
    throw new Error("PostGraphile endpoint is required");
  }

  // Default headers for PostGraphile
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const client = new GraphQLClient(endpoint, {
    headers: defaultHeaders,
    // Note: timeout and other properties may not be in RequestConfig type
    // but they work at runtime
    ...(timeout && { timeout }),
  } as any);

  // Add request middleware for logging/debugging
  if (process.env.NODE_ENV === "development") {
    client.requestConfig.requestMiddleware = (request: any) => {
      console.log("[PostGraphile] GraphQL Request:", {
        query: request.body?.query?.substring(0, 100) + "...",
        variables: request.body?.variables,
      });
      return request;
    };

    client.requestConfig.responseMiddleware = (response: any) => {
      if (response.errors) {
        console.warn("[PostGraphile] GraphQL Errors:", response.errors);
      }
      return response;
    };
  }

  return client;
}

/**
 * Updates the headers of an existing GraphQL client
 *
 * @param client - GraphQL client instance
 * @param headers - New headers to set
 */
export function updateClientHeaders(
  client: GraphQLClient,
  headers: Record<string, string>
): void {
  const currentHeaders = (client.requestConfig as any).headers || {};
  (client.requestConfig as any).headers = {
    ...currentHeaders,
    ...headers,
  };
}

/**
 * Sets the authorization token for the GraphQL client
 *
 * @param client - GraphQL client instance
 * @param token - JWT token or Bearer token
 * @param tokenType - Token type (Bearer, JWT, etc.)
 */
export function setAuthToken(
  client: GraphQLClient,
  token: string,
  tokenType: "Bearer" | "JWT" = "Bearer"
): void {
  updateClientHeaders(client, {
    Authorization: `${tokenType} ${token}`,
  });
}

/**
 * Removes the authorization token from the GraphQL client
 *
 * @param client - GraphQL client instance
 */
export function clearAuthToken(client: GraphQLClient): void {
  const headers = { ...(client.requestConfig as any).headers };
  delete headers.Authorization;
  (client.requestConfig as any).headers = headers;
}

/**
 * Creates a GraphQL query string with proper indentation
 *
 * @param operation - GraphQL operation type (query/mutation)
 * @param name - Operation name
 * @param variables - Variable definitions
 * @param selection - Field selection
 * @returns Formatted GraphQL query string
 */
export function buildGraphQLQuery(
  operation: "query" | "mutation",
  name: string,
  variables: string[],
  selection: string
): string {
  const variableDefs = variables.length > 0 ? `(${variables.join(", ")})` : "";
  return `
    ${operation} ${name}${variableDefs} {
      ${selection}
    }
  `.trim();
}

/**
 * Creates a GraphQL mutation string for CRUD operations
 *
 * @param operation - Mutation operation name
 * @param inputType - Input type name
 * @param selection - Field selection for the response
 * @returns GraphQL mutation string
 */
export function buildGraphQLMutation(
  operation: string,
  inputType: string,
  selection: string
): string {
  return `
    mutation ${operation}($input: ${inputType}!) {
      ${operation}(input: $input) {
        ${selection}
      }
    }
  `.trim();
}

/**
 * Validates a GraphQL endpoint by making a simple introspection query
 *
 * @param endpoint - GraphQL endpoint URL
 * @param headers - Optional headers for the request
 * @returns Promise that resolves if endpoint is valid
 */
export async function validateEndpoint(
  endpoint: string,
  headers?: Record<string, string>
): Promise<void> {
  const client = new GraphQLClient(endpoint, { headers } as any);

  const query = `
    query ValidateEndpoint {
      __schema {
        queryType {
          name
        }
      }
    }
  `;

  try {
    await client.request(query);
  } catch (error: any) {
    throw new Error(`Invalid PostGraphile endpoint: ${endpoint}. ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Extracts operation name from a GraphQL query/mutation string
 *
 * @param query - GraphQL query string
 * @returns Operation name or null if not found
 */
export function extractOperationName(query: string): string | null {
  const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  return match && match[1] ? match[1] : null;
}

/**
 * Validates GraphQL operation name for security
 *
 * @param operationName - Operation name to validate
 * @throws Error if operation name is invalid
 */
export function validateOperationName(operationName: string): void {
  if (!operationName || typeof operationName !== "string") {
    throw new Error("Operation name must be a non-empty string");
  }

  // Prevent operation names that could be used for injection
  if (operationName.includes("__") || operationName.startsWith("_")) {
    throw new Error(`Operation name '${operationName}' is not allowed (reserved GraphQL fields)`);
  }

  // Prevent suspicious characters
  if (/[<>'"&\\]/.test(operationName)) {
    throw new Error(`Operation name '${operationName}' contains invalid characters`);
  }

  // Limit operation name length
  if (operationName.length > 50) {
    throw new Error("Operation name is too long (maximum 50 characters)");
  }

  // Ensure valid GraphQL identifier pattern
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(operationName)) {
    throw new Error(`Operation name '${operationName}' is not a valid GraphQL identifier`);
  }
}

/**
 * Sanitizes a GraphQL query by removing unnecessary whitespace and preventing injection
 *
 * @param query - GraphQL query string
 * @returns Sanitized query string
 */
export function sanitizeGraphQLQuery(query: string): string {
  if (typeof query !== "string") {
    throw new Error("GraphQL query must be a string");
  }

  // Prevent extremely long queries that could be used for DoS
  if (query.length > 10000) {
    throw new Error("GraphQL query is too long (maximum 10000 characters)");
  }

  let sanitized = query
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\s*{\s*/g, " { ") // Normalize braces
    .replace(/\s*}\s*/g, " } ")
    .replace(/\s*\(\s*/g, "(") // Normalize parentheses
    .replace(/\s*\)\s*/g, ")")
    .trim();

  // Additional security checks
  // Prevent suspicious patterns that could indicate injection attempts
  const suspiciousPatterns = [
    /\b__\w+\b/g, // Introspection fields like __schema, __type
    /\\x[0-9a-f]{2}/gi, // Hex-encoded characters
    /\\u[0-9a-f]{4}/gi, // Unicode escape sequences
    /javascript:/gi, // JavaScript URLs (in case of misuse)
    /data:/gi, // Data URLs
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error("GraphQL query contains suspicious patterns that are not allowed");
    }
  }

  return sanitized || "";
}

/**
 * Creates a GraphQL fragment string
 *
 * @param name - Fragment name
 * @param type - Type condition
 * @param selection - Field selection
 * @returns GraphQL fragment string
 */
export function buildGraphQLFragment(
  name: string,
  type: string,
  selection: string
): string {
  return `
    fragment ${name} on ${type} {
      ${selection}
    }
  `.trim();
}

/**
 * Merges multiple GraphQL selection sets
 *
 * @param selections - Array of selection strings
 * @returns Merged selection string
 */
export function mergeSelections(selections: string[]): string {
  const fields = new Set<string>();

  selections.forEach(selection => {
    // Split by newlines and clean up
    const lines = selection.split("\n").map(line => line.trim()).filter(Boolean);

    lines.forEach(line => {
      // Remove leading spaces and add to set
      const cleanLine = line.replace(/^\s+/, "");
      if (cleanLine) {
        fields.add(cleanLine);
      }
    });
  });

  return Array.from(fields).join("\n      ");
}

/**
 * Creates a GraphQL variable definition string
 *
 * @param name - Variable name
 * @param type - GraphQL type
 * @param defaultValue - Optional default value
 * @returns Variable definition string
 */
export function buildVariableDefinition(
  name: string,
  type: string,
  defaultValue?: string
): string {
  const defaultPart = defaultValue ? ` = ${defaultValue}` : "";
  return `$${name}: ${type}${defaultPart}`;
}

/**
 * Converts snake_case to camelCase
 * 
 * @param str - String in snake_case
 * @returns String in camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively converts object keys from snake_case to camelCase
 * This is needed because PostGraphile uses camelCase in GraphQL schema,
 * but Refine forms often use snake_case field names
 * 
 * @param obj - Object with potentially snake_case keys
 * @returns Object with camelCase keys
 */
export function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = convertKeysToCamelCase(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}
