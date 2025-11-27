import { describe, it, expect, beforeEach, vi } from "vitest";
import { GraphQLClient } from "graphql-request";
import { dataProvider } from "../../src/dataProvider/index.ts";
import type { PostGraphileDataProvider } from "../../src/interfaces.ts";

vi.mock("graphql-request");

describe("PostGraphile Data Provider - Advanced Filtering Contract Tests", () => {
  let mockClient: GraphQLClient;
  let provider: PostGraphileDataProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = new GraphQLClient("https://api.example.com/graphql");
    provider = dataProvider(mockClient, {
      endpoint: "https://api.example.com/graphql",
    });
  });

  describe("Advanced Filter Operators", () => {
    it("should support equality operators", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John" }],
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
          { field: "name", operator: "eq" as const, value: "John" },
          { field: "age", operator: "ne" as const, value: 25 },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          filter: {
            name: { equalTo: "John" },
            age: { notEqualTo: 25 },
          },
        })
      );
    });

    it("should support comparison operators", async () => {
      const mockResponse = {
        allProducts: {
          nodes: [{ id: "1", price: 100 }],
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
          { field: "price", operator: "gt" as const, value: 50 },
          { field: "price", operator: "lte" as const, value: 200 },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allProducts"),
        expect.objectContaining({
          filter: {
            price: {
              greaterThan: 50,
              lessThanOrEqualTo: 200,
            },
          },
        })
      );
    });

    it("should support array and inclusion operators", async () => {
      const mockResponse = {
        allPosts: {
          nodes: [{ id: "1", tags: ["javascript", "react"] }],
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
        resource: "posts",
        filters: [
          { field: "category", operator: "in" as const, value: ["tech", "news"] },
          { field: "tags", operator: "contains" as const, value: "javascript" },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          filter: {
            category: { in: ["tech", "news"] },
            tags: { includes: "javascript" },
          },
        })
      );
    });

    it("should support string pattern matching", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", email: "john@example.com" }],
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
          { field: "email", operator: "startswith" as const, value: "john" },
          { field: "name", operator: "endswith" as const, value: "son" },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          filter: {
            email: { startsWith: "john" },
            name: { endsWith: "son" },
          },
        })
      );
    });

    it("should support null checking", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", deletedAt: null }],
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
          { field: "deletedAt", operator: "null" as const, value: true },
          { field: "verified", operator: "nnull" as const, value: false },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          filter: {
            deletedAt: { isNull: true },
            verified: { isNull: false },
          },
        })
      );
    });

    it("should support complex logical combinations", async () => {
      const mockResponse = {
        allPosts: {
          nodes: [{ id: "1", title: "Post 1" }],
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
        resource: "posts",
        filters: [
          {
            operator: "and" as const,
            value: [
              { field: "status", operator: "eq" as const, value: "published" },
              {
                operator: "or" as const,
                value: [
                  { field: "category", operator: "eq" as const, value: "tech" },
                  { field: "category", operator: "eq" as const, value: "news" },
                ],
              },
            ],
          },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          filter: {
            and: [
              { status: { equalTo: "published" } },
              {
                or: [
                  { category: { equalTo: "tech" } },
                  { category: { equalTo: "news" } },
                ],
              },
            ],
          },
        })
      );
    });

    it("should support nested field filtering", async () => {
      const mockResponse = {
        allPosts: {
          nodes: [{ id: "1", author: { name: "John" } }],
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
        resource: "posts",
        filters: [
          { field: "author.name", operator: "contains" as const, value: "John" },
        ],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allPosts"),
        expect.objectContaining({
          filter: {
            "author.name": { includes: "John" },
          },
        })
      );
    });

    it("should handle empty filter arrays", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John" }],
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
        filters: [],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.not.objectContaining({
          filter: expect.anything(),
        })
      );
    });

    it("should handle undefined filters", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John" }],
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
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.not.objectContaining({
          filter: expect.anything(),
        })
      );
    });
  });
});
