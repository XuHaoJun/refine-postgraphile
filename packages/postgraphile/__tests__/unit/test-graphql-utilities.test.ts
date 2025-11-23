import { describe, it, expect, vi } from "vitest";
import {
  extractOperationName,
  sanitizeGraphQLQuery,
  mergeSelections,
  buildVariableDefinition,
  validateOperationName,
} from "../../src/utils/graphql";

describe("extractOperationName", () => {
  it("should extract operation name from query string", () => {
    const query = `
      query GetUsers($first: Int) {
        users(first: $first) {
          id
          name
        }
      }
    `;

    const result = extractOperationName(query);

    expect(result).toBe("GetUsers");
  });

  it("should extract operation name from mutation", () => {
    const query = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          user {
            id
            name
          }
        }
      }
    `;

    const result = extractOperationName(query);

    expect(result).toBe("CreateUser");
  });

  it("should extract operation name from subscription", () => {
    const query = `
      subscription UserChanged {
        listen(topic: "users_changed") {
          relatedNode {
            id
            name
          }
        }
      }
    `;

    const result = extractOperationName(query);

    expect(result).toBe("UserChanged");
  });

  it("should return null for query without proper keyword", () => {
    const query = "string GetUsers { users { id } }";

    const result = extractOperationName(query);

    expect(result).toBeNull(); // Regex requires query/mutation keyword
  });
});

describe("sanitizeGraphQLQuery", () => {
  it("should normalize whitespace", () => {
    const query = `
      query   GetUsers   {
        users     {
          id
          name
        }
      }
    `;

    const result = sanitizeGraphQLQuery(query);

    expect(result).toContain("query GetUsers {");
    expect(result).toContain("users {");
  });

  it("should preserve comments", () => {
    const query = `
      # This is a comment
      query GetUsers {
        users {
          id # inline comment
          name
        }
      }
    `;

    const result = sanitizeGraphQLQuery(query);

    expect(result).toContain("#");
    expect(result).toContain("query GetUsers");
  });

  it("should handle empty string", () => {
    const result = sanitizeGraphQLQuery("");

    expect(result).toBe("");
  });
});

describe("mergeSelections", () => {
  it("should merge selection strings", () => {
    const selections = ["id", "name", "email"];

    const result = mergeSelections(selections);

    expect(result).toBe("id\n      name\n      email");
  });

  it("should handle nested selections", () => {
    const selections = [
      "id",
      "name",
      `
        posts {
          id
          title
        }
      `,
    ];

    const result = mergeSelections(selections);

    expect(result).toContain("id");
    expect(result).toContain("name");
    expect(result).toContain("posts {");
  });

  it("should handle empty array", () => {
    const result = mergeSelections([]);

    expect(result).toBe("");
  });
});

describe("buildVariableDefinition", () => {
  it("should build variable definition for simple type", () => {
    const result = buildVariableDefinition("id", "String");

    expect(result).toBe("$id: String");
  });

  it("should build variable definition with default value", () => {
    const result = buildVariableDefinition("count", "Int", "10");

    expect(result).toBe("$count: Int = 10");
  });

  it("should build variable definition for complex type", () => {
    const result = buildVariableDefinition("input", "CreateUserInput!");

    expect(result).toBe("$input: CreateUserInput!");
  });
});

describe("validateOperationName", () => {
  it("should accept valid operation names", () => {
    expect(() => validateOperationName("GetUsers")).not.toThrow();
    expect(() => validateOperationName("createUser")).not.toThrow();
    expect(() => validateOperationName("validName")).not.toThrow();
    expect(() => validateOperationName("user123")).not.toThrow();
  });

  it("should reject empty operation names", () => {
    expect(() => validateOperationName("")).toThrow("must be a non-empty string");
  });

  it("should reject invalid operation names", () => {
    expect(() => validateOperationName("   ")).toThrow("not a valid GraphQL identifier");
  });

  it("should reject operation names with reserved GraphQL fields", () => {
    expect(() => validateOperationName("__schema")).toThrow("not allowed");
    expect(() => validateOperationName("__type")).toThrow("not allowed");
    expect(() => validateOperationName("_internal")).toThrow("not allowed");
  });

  it("should reject operation names with invalid characters", () => {
    expect(() => validateOperationName("user<script>")).toThrow("invalid characters");
    expect(() => validateOperationName("user&name")).toThrow("invalid characters");
    expect(() => validateOperationName("user'name")).toThrow("invalid characters");
  });

  it("should reject operation names that are too long", () => {
    const longName = "a".repeat(51);
    expect(() => validateOperationName(longName)).toThrow("too long");
  });

  it("should reject operation names that are not valid GraphQL identifiers", () => {
    expect(() => validateOperationName("123invalid")).toThrow("not a valid GraphQL identifier");
    expect(() => validateOperationName("user-name")).toThrow("not a valid GraphQL identifier");
    expect(() => validateOperationName("user.name")).toThrow("not a valid GraphQL identifier");
  });
});

describe("sanitizeGraphQLQuery security", () => {
  it("should reject non-string inputs", () => {
    expect(() => sanitizeGraphQLQuery(null as any)).toThrow("must be a string");
    expect(() => sanitizeGraphQLQuery(123 as any)).toThrow("must be a string");
  });

  it("should reject extremely long queries", () => {
    const longQuery = "query { " + "field ".repeat(3000) + "}";
    expect(() => sanitizeGraphQLQuery(longQuery)).toThrow("too long");
  });

  it("should reject queries with suspicious patterns", () => {
    expect(() => sanitizeGraphQLQuery("query { __schema { types { name } } }")).toThrow("suspicious patterns");
    expect(() => sanitizeGraphQLQuery("query { field \\x41 }")).toThrow("suspicious patterns");
    expect(() => sanitizeGraphQLQuery("query { field \\u0041 }")).toThrow("suspicious patterns");
  });
});
