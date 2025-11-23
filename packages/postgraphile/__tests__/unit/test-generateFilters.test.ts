import { describe, it, expect } from "vitest";
import { generateFilters, analyzeQueryPerformance } from "../../src/utils/generateFilters.ts";
import type { FilterOptions } from "../../src/interfaces.ts";
import type { CrudFilter } from "@refinedev/core";

describe("generateFilters Utility - Unit Tests", () => {
  describe("Operator Mapping", () => {
    it("should map equality operators correctly", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "eq", value: "John" },
        { field: "age", operator: "ne", value: 25 },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        name: { equalTo: "John" },
        age: { notEqualTo: 25 },
      });
    });

    it("should map comparison operators correctly", () => {
      const filters: CrudFilter[] = [
        { field: "price", operator: "gt", value: 100 },
        { field: "price", operator: "lt", value: 500 },
        { field: "price", operator: "gte", value: 0 },
        { field: "price", operator: "lte", value: 1000 },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        price: {
          greaterThan: 100,
          lessThan: 500,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 1000,
        },
      });
    });

    it("should map inclusion operators correctly", () => {
      const filters: CrudFilter[] = [
        { field: "category", operator: "in", value: ["electronics", "books"] },
        { field: "status", operator: "nin", value: ["draft", "archived"] },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        category: { in: ["electronics", "books"] },
        status: { notIn: ["draft", "archived"] },
      });
    });

    it("should map string pattern operators correctly", () => {
      const filters: CrudFilter[] = [
        { field: "title", operator: "contains", value: "React" },
        { field: "title", operator: "ncontains", value: "Draft" },
        { field: "name", operator: "startswith", value: "Mr" },
        { field: "name", operator: "nstartswith", value: "Dr" },
        { field: "email", operator: "endswith", value: "@example.com" },
        { field: "email", operator: "nendswith", value: "@test.com" },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        title: {
          contains: "React",
          notContains: "Draft",
        },
        name: {
          startsWith: "Mr",
          notStartsWith: "Dr",
        },
        email: {
          endsWith: "@example.com",
          notEndsWith: "@test.com",
        },
      });
    });

    it("should map null checking operators correctly", () => {
      const filters: CrudFilter[] = [
        { field: "deletedAt", operator: "null", value: true },
        { field: "verified", operator: "null", value: false },
        { field: "approved", operator: "nnull", value: true },
        { field: "banned", operator: "nnull", value: false },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        deletedAt: { isNull: true },
        verified: { isNull: false },
        approved: { isNull: false },
        banned: { isNull: true },
      });
    });

    it("should handle containss and ncontainss operators", () => {
      const filters: CrudFilter[] = [
        { field: "tags", operator: "containss", value: "urgent" },
        { field: "tags", operator: "ncontainss", value: "draft" },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        tags: {
          contains: "urgent",
          notContains: "draft",
        },
      });
    });

    it("should default to equalTo for unknown operators", () => {
      const filters: CrudFilter[] = [
        { field: "status", operator: "unknown" as any, value: "active" },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        status: { equalTo: "active" },
      });
    });
  });

  describe("Logical Operators", () => {
    it("should handle AND combinations", () => {
      const filters: CrudFilter[] = [
        {
          operator: "and",
          value: [
            { field: "status", operator: "eq", value: "active" },
            { field: "age", operator: "gt", value: 18 },
          ],
        },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        and: [
          { status: { equalTo: "active" } },
          { age: { greaterThan: 18 } },
        ],
      });
    });

    it("should handle OR combinations", () => {
      const filters: CrudFilter[] = [
        {
          operator: "or",
          value: [
            { field: "category", operator: "eq", value: "electronics" },
            { field: "category", operator: "eq", value: "books" },
          ],
        },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        or: [
          { category: { equalTo: "electronics" } },
          { category: { equalTo: "books" } },
        ],
      });
    });

    it("should handle nested logical operators", () => {
      const filters: CrudFilter[] = [
        {
          operator: "and",
          value: [
            { field: "status", operator: "eq", value: "active" },
            {
              operator: "or",
              value: [
                { field: "category", operator: "eq", value: "premium" },
                { field: "priority", operator: "gt", value: 5 },
              ],
            },
          ],
        },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        and: [
          { status: { equalTo: "active" } },
          {
            or: [
              { category: { equalTo: "premium" } },
              { priority: { greaterThan: 5 } },
            ],
          },
        ],
      });
    });
  });

  describe("Field Merging", () => {
    it("should merge multiple filters on the same field", () => {
      const filters: CrudFilter[] = [
        { field: "price", operator: "gt", value: 100 },
        { field: "price", operator: "lt", value: 500 },
        { field: "price", operator: "ne", value: 250 },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        price: {
          greaterThan: 100,
          lessThan: 500,
          notEqualTo: 250,
        },
      });
    });

    it("should handle complex field merging with different operator types", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "contains", value: "John" },
        { field: "name", operator: "startswith", value: "J" },
        { field: "name", operator: "endswith", value: "n" },
        { field: "age", operator: "gt", value: 18 },
        { field: "age", operator: "lt", value: 65 },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        name: {
          contains: "John",
          startsWith: "J",
          endsWith: "n",
        },
        age: {
          greaterThan: 18,
          lessThan: 65,
        },
      });
    });
  });

  describe("Edge Cases", () => {
    it("should return empty object for empty filters array", () => {
      const result = generateFilters([]);
      expect(result).toEqual({});
    });

    it("should return empty object for undefined filters", () => {
      const result = generateFilters(undefined as any);
      expect(result).toEqual({});
    });

    it("should skip filters without field and operator", () => {
      const filters: CrudFilter[] = [
        { value: "invalid" } as any,
        { operator: "invalid" as any },
        { field: "valid", operator: "eq", value: "test" },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        valid: { equalTo: "test" },
      });
    });

    it("should handle null and undefined values", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "eq", value: null },
        { field: "description", operator: "eq", value: undefined },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        name: { equalTo: null },
        description: { equalTo: undefined },
      });
    });

    it("should handle array values correctly", () => {
      const filters: CrudFilter[] = [
        { field: "tags", operator: "in", value: ["react", "vue", "angular"] },
        { field: "categories", operator: "contains", value: ["tech", "web"] },
        { field: "userTags", operator: "containedBy" as any, value: ["premium", "vip"] },
        { field: "sharedTags", operator: "overlaps" as any, value: ["featured", "trending"] },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        tags: { in: ["react", "vue", "angular"] },
        categories: { contains: ["tech", "web"] },
        userTags: { containedBy: ["premium", "vip"] },
        sharedTags: { overlaps: ["featured", "trending"] },
      });
    });

    it("should handle PostgreSQL JSONB operators", () => {
      const filters: CrudFilter[] = [
        { field: "metadata", operator: "contains", value: { category: "electronics" } },
        { field: "settings", operator: "hasKey" as any, value: "theme" },
        { field: "config", operator: "containedBy" as any, value: { enabled: true, features: ["basic"] } },
      ];

      const result = generateFilters(filters);

      expect(result).toEqual({
        metadata: { contains: { category: "electronics" } },
        settings: { hasKey: "theme" },
        config: { containedBy: { enabled: true, features: ["basic"] } },
      });
    });
  });

  describe("Security Validation", () => {
    it("should restrict operators based on allowedOperators", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "contains", value: "test" },
        { field: "status", operator: "in", value: ["active"] },
      ];

      const options: FilterOptions = {
        allowedOperators: ["eq", "ne"],
      };

      expect(() => generateFilters(filters, options)).toThrow(
        "Filter operator 'contains' is not allowed"
      );
    });

    it("should allow operators that are in allowedOperators list", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "eq", value: "test" },
        { field: "status", operator: "ne", value: "inactive" },
      ];

      const options: FilterOptions = {
        allowedOperators: ["eq", "ne"],
      };

      const result = generateFilters(filters, options);

      expect(result).toEqual({
        name: { equalTo: "test" },
        status: { notEqualTo: "inactive" },
      });
    });

    it("should reject null inputs when not allowed", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "eq", value: null },
      ];

      const options: FilterOptions = {
        allowNullInput: false,
      };

      expect(() => generateFilters(filters, options)).toThrow(
        "Null values are not allowed in filter inputs"
      );
    });

    it("should allow null inputs when explicitly allowed", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "eq", value: null },
      ];

      const options: FilterOptions = {
        allowNullInput: true,
      };

      const result = generateFilters(filters, options);

      expect(result).toEqual({
        name: { equalTo: null },
      });
    });

    it("should reject empty objects when not allowed", () => {
      const filters: CrudFilter[] = [
        { field: "metadata", operator: "contains", value: {} },
      ];

      const options: FilterOptions = {
        allowEmptyObjectInput: false,
      };

      expect(() => generateFilters(filters, options)).toThrow(
        "Empty objects are not allowed in filter inputs"
      );
    });

    it("should reject field names with GraphQL introspection patterns", () => {
      const filters: CrudFilter[] = [
        { field: "__typename", operator: "eq", value: "User" },
        { field: "_internal", operator: "eq", value: "secret" },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "Field name '__typename' is not allowed"
      );
    });

    it("should reject field names with invalid characters", () => {
      const filters: CrudFilter[] = [
        { field: 'name<script>', operator: "eq", value: "test" },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "Field name 'name<script>' contains invalid characters"
      );
    });

    it("should reject extremely long field names", () => {
      const longFieldName = "a".repeat(101);
      const filters: CrudFilter[] = [
        { field: longFieldName, operator: "eq", value: "test" },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "Field name is too long (maximum 100 characters)"
      );
    });

    it("should reject extremely large arrays", () => {
      const largeArray = new Array(1001).fill("item");
      const filters: CrudFilter[] = [
        { field: "tags", operator: "in", value: largeArray },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "Array filter values are too large (maximum 1000 items)"
      );
    });

    it("should reject extremely long strings", () => {
      const longString = "a".repeat(10001);
      const filters: CrudFilter[] = [
        { field: "description", operator: "contains", value: longString },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "String filter values are too long (maximum 10000 characters)"
      );
    });

    it("should reject deeply nested objects", () => {
      const deeplyNested = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      h: {
                        i: {
                          j: {
                            k: {
                              l: "deep"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const filters: CrudFilter[] = [
        { field: "metadata", operator: "contains", value: deeplyNested },
      ];

      const options: FilterOptions = {}; // Enable advanced validation

      expect(() => generateFilters(filters, options)).toThrow(
        "Filter object values are too deeply nested (maximum depth 10)"
      );
    });

    it("should validate nested filters recursively", () => {
      const filters: CrudFilter[] = [
        {
          operator: "and",
          value: [
            { field: "__typename", operator: "eq", value: "User" },
          ],
        },
      ];

      expect(() => generateFilters(filters)).toThrow(
        "Field name '__typename' is not allowed"
      );
    });
  });

  describe("Performance Analysis", () => {
    it("should analyze simple query performance", () => {
      const filters: CrudFilter[] = [{ field: "name", operator: "eq", value: "test" }];
      const pagination = { pageSize: 10 };
      const sorters = [{ field: "name", order: "asc" }];
      const fields = ["id", "name"];

      const result = analyzeQueryPerformance(filters, pagination, sorters, fields);

      expect(result.complexity).toBeGreaterThan(0);
      expect(result.complexity).toBeLessThanOrEqual(10);
      expect(result.cacheable).toBe(true);
      expect(result.estimatedSize).toBe('small');
      expect(result.suggestions).toHaveLength(0);
    });

    it("should detect high complexity queries", () => {
      const filters: CrudFilter[] = [
        { field: "name", operator: "contains", value: "test" },
        { field: "description", operator: "contains", value: "complex" },
        { field: "tags", operator: "overlaps" as any, value: ["tag1", "tag2"] },
        {
          operator: "and",
          value: [
            { field: "status", operator: "eq", value: "active" },
            { field: "category", operator: "in", value: ["a", "b", "c", "d", "e"] },
          ],
        },
      ];
      const pagination = { pageSize: 100 };
      const sorters = [
        { field: "name", order: "asc" },
        { field: "createdAt", order: "desc" },
        { field: "priority", order: "desc" },
      ];

      const result = analyzeQueryPerformance(filters, pagination, sorters);

      expect(result.complexity).toBeGreaterThan(30);
      expect(result.cacheable).toBe(false); // Contains dynamic text filters
      expect(result.suggestions).toContain('Consider using more specific filters to reduce result set');
      expect(result.suggestions).toContain('Dynamic text filters prevent query caching');
    });

    it("should suggest optimizations for large page sizes", () => {
      const filters: CrudFilter[] = [];
      const pagination = { pageSize: 200 };

      const result = analyzeQueryPerformance(filters, pagination);

      expect(result.suggestions).toContain('Consider reducing page size for better performance');
    });

    it("should suggest optimizations for many selected fields", () => {
      const filters: CrudFilter[] = [{ field: "name", operator: "eq", value: "test" }];
      const fields = Array.from({ length: 25 }, (_, i) => `field${i}`);

      const result = analyzeQueryPerformance(filters, undefined, undefined, fields);

      expect(result.suggestions).toContain('Selecting many fields may impact performance');
    });

    it("should estimate result sizes correctly", () => {
      // Small result
      const smallResult = analyzeQueryPerformance(
        [{ field: "id", operator: "eq", value: "123" }] as CrudFilter[],
        { pageSize: 10 }
      );
      expect(smallResult.estimatedSize).toBe('small');

      // Medium result
      const mediumResult = analyzeQueryPerformance(
        [] as CrudFilter[],
        { pageSize: 50 }
      );
      expect(mediumResult.estimatedSize).toBe('medium');

      // Large result
      const largeResult = analyzeQueryPerformance(
        [] as CrudFilter[],
        { pageSize: 100 }
      );
      expect(largeResult.estimatedSize).toBe('large');
    });

    it("should handle empty inputs", () => {
      const result = analyzeQueryPerformance([] as CrudFilter[]);

      expect(result.complexity).toBe(0);
      expect(result.cacheable).toBe(true);
      expect(result.estimatedSize).toBe('small');
      expect(result.suggestions).toHaveLength(0);
    });
  });
});
