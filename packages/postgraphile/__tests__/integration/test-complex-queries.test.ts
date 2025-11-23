import { describe, it, expect, beforeEach, vi } from "vitest";
import { GraphQLClient } from "graphql-request";
import { dataProvider } from "../../src/dataProvider/index.ts";
import type { PostGraphileDataProvider } from "../../src/interfaces.ts";

vi.mock("graphql-request");

describe("PostGraphile Data Provider - Complex Queries Integration Tests", () => {
  let mockClient: GraphQLClient;
  let provider: PostGraphileDataProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = new GraphQLClient("https://api.example.com/graphql");
    provider = dataProvider(mockClient, {
      endpoint: "https://api.example.com/graphql",
    });
  });

  describe("Complex Filtering and Sorting Scenarios", () => {
    it("should handle complex multi-field filtering with sorting", async () => {
      const mockResponse = {
        allPosts: {
          nodes: [
            {
              id: "1",
              title: "Advanced React Patterns",
              status: "published",
              views: 1500,
              author: { name: "John Doe" },
              tags: ["react", "javascript"],
              createdAt: "2024-01-15T10:00:00Z",
            },
            {
              id: "2",
              title: "GraphQL Best Practices",
              status: "published",
              views: 2100,
              author: { name: "Jane Smith" },
              tags: ["graphql", "api"],
              createdAt: "2024-01-10T15:30:00Z",
            },
          ],
          totalCount: 2,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: "cursor1",
            endCursor: "cursor2",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "posts",
        pagination: { currentPage: 1, pageSize: 10 },
        sorters: [
          { field: "views", order: "desc" as const },
          { field: "createdAt", order: "desc" as const },
        ],
        filters: [
          { field: "status", operator: "eq" as const, value: "published" },
          { field: "views", operator: "gte" as const, value: 1000 },
          { field: "title", operator: "contains" as const, value: "React" },
          { field: "author.name", operator: "startswith" as const, value: "J" },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);

      // Verify the GraphQL query was called with correct parameters
      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          first: 10,
          orderBy: ["views_DESC", "createdAt_DESC"],
          filter: {
            status: { equalTo: "published" },
            views: { greaterThanOrEqualTo: 1000 },
            title: { contains: "React" },
            "author.name": { startsWith: "J" },
          },
        })
      );
    });

    it("should handle logical operator combinations", async () => {
      const mockResponse = {
        allProducts: {
          nodes: [
            {
              id: "1",
              name: "Premium Widget",
              category: "electronics",
              price: 299.99,
              inStock: true,
              tags: ["premium", "bestseller"],
            },
          ],
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "products",
        filters: [
          {
            operator: "and" as const,
            value: [
              { field: "inStock", operator: "eq" as const, value: true },
              { field: "price", operator: "lt" as const, value: 500 },
              {
                operator: "or" as const,
                value: [
                  { field: "category", operator: "eq" as const, value: "electronics" },
                  { field: "tags", operator: "contains" as const, value: "premium" },
                ],
              },
            ],
          },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allProducts"),
        expect.objectContaining({
          filter: {
            and: [
              { inStock: { equalTo: true } },
              { price: { lessThan: 500 } },
              {
                or: [
                  { category: { equalTo: "electronics" } },
                  { tags: { contains: "premium" } },
                ],
              },
            ],
          },
        })
      );
    });

    it("should handle array field filtering", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [
            {
              id: "1",
              name: "Alice Johnson",
              roles: ["admin", "moderator"],
              skills: ["javascript", "react", "typescript"],
            },
          ],
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        filters: [
          { field: "roles", operator: "contains" as const, value: "admin" },
          { field: "skills", operator: "in" as const, value: ["javascript", "typescript"] },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(1);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          filter: {
            roles: { contains: "admin" },
            skills: { in: ["javascript", "typescript"] },
          },
        })
      );
    });

    it("should handle date range filtering with complex conditions", async () => {
      const mockResponse = {
        allOrders: {
          nodes: [
            {
              id: "1",
              orderDate: "2024-01-15T10:00:00Z",
              status: "completed",
              totalAmount: 150.50,
              customer: { vipStatus: true },
            },
          ],
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "orders",
        sorters: [{ field: "orderDate", order: "desc" as const }],
        filters: [
          { field: "orderDate", operator: "gte" as const, value: "2024-01-01T00:00:00Z" },
          { field: "orderDate", operator: "lte" as const, value: "2024-01-31T23:59:59Z" },
          { field: "status", operator: "in" as const, value: ["completed", "processing"] },
          { field: "totalAmount", operator: "gt" as const, value: 100 },
          { field: "customer.vipStatus", operator: "eq" as const, value: true },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(1);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allOrders"),
        expect.objectContaining({
          orderBy: ["orderDate_DESC"],
          filter: {
            orderDate: {
              greaterThanOrEqualTo: "2024-01-01T00:00:00Z",
              lessThanOrEqualTo: "2024-01-31T23:59:59Z",
            },
            status: { in: ["completed", "processing"] },
            totalAmount: { greaterThan: 100 },
            "customer.vipStatus": { equalTo: true },
          },
        })
      );
    });

    it("should handle pagination with complex filters", async () => {
      const mockResponse = {
        allArticles: {
          nodes: [
            { id: "11", title: "Article 11" },
            { id: "12", title: "Article 12" },
          ],
          totalCount: 50,
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: "cursor11",
            endCursor: "cursor12",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "articles",
        pagination: { currentPage: 2, pageSize: 10 },
        sorters: [{ field: "publishedAt", order: "desc" as const }],
        filters: [
          { field: "published", operator: "eq" as const, value: true },
          { field: "category", operator: "ne" as const, value: "draft" },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(50);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allArticles"),
        expect.objectContaining({
          first: 10,
          orderBy: ["publishedAt_DESC"],
          filter: {
            published: { equalTo: true },
            category: { notEqualTo: "draft" },
          },
        })
      );
    });

    it("should handle empty results with complex filters", async () => {
      const mockResponse = {
        allEvents: {
          nodes: [],
          totalCount: 0,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "events",
        filters: [
          { field: "startDate", operator: "lt" as const, value: "2024-01-01T00:00:00Z" },
          { field: "status", operator: "eq" as const, value: "cancelled" },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should handle cursor-based pagination correctly", async () => {
      const mockResponse = {
        allPosts: {
          nodes: [
            { id: "11", title: "Post 11" },
            { id: "12", title: "Post 12" },
          ],
          totalCount: 50,
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: "cursor11",
            endCursor: "cursor12",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      // Test page 1 (no cursor)
      const params1 = {
        resource: "posts",
        pagination: { currentPage: 1, pageSize: 10 },
      };

      await provider.getList(params1);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          first: 10,
        })
      );

      // Verify no 'after' parameter for first page
      const callArgs1 = (mockClient.request as any).mock.calls[0][1];
      expect(callArgs1.after).toBeUndefined();

      // Reset mock for second call
      (mockClient.request as any).mockClear();

      // Test page 3 (should have cursor)
      const params3 = {
        resource: "posts",
        pagination: { currentPage: 3, pageSize: 10 },
      };

      await provider.getList(params3);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          first: 10,
          after: expect.any(String), // Should have base64 encoded cursor
        })
      );

      // Verify cursor is base64 encoded offset
      const callArgs = (mockClient.request as any).mock.calls[0][1];
      const decodedCursor = Buffer.from(callArgs.after, 'base64').toString();
      expect(decodedCursor).toBe('offset:20'); // (page 3 - 1) * 10 = 20
    });

    it("should handle PostgreSQL advanced types filtering", async () => {
      const mockResponse = {
        allProducts: {
          nodes: [
            {
              id: "1",
              name: "Advanced Widget",
              tags: ["electronics", "smart"],
              metadata: { category: "premium", features: ["wifi", "bluetooth"] },
              settings: { theme: "dark", notifications: true },
            },
          ],
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "products",
        filters: [
          { field: "tags", operator: "containedBy" as any, value: ["electronics", "smart", "premium"] },
          { field: "tags", operator: "overlaps" as any, value: ["smart", "wifi"] },
          { field: "metadata", operator: "contains" as const, value: { category: "premium" } },
          { field: "settings", operator: "hasKey" as any, value: "theme" },
          { field: "metadata", operator: "containedBy" as any, value: { category: "premium", features: ["wifi", "bluetooth", "5g"] } },
        ],
      };

      const result = await provider.getList(params);

      expect(result.data).toHaveLength(1);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allProducts"),
        expect.objectContaining({
          filter: {
            tags: {
              containedBy: ["electronics", "smart", "premium"],
              overlaps: ["smart", "wifi"],
            },
            metadata: {
              contains: { category: "premium" },
              containedBy: { category: "premium", features: ["wifi", "bluetooth", "5g"] },
            },
            settings: { hasKey: "theme" },
          },
        })
      );
    });
  });
});
