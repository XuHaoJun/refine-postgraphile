import { describe, it, expect, beforeEach, vi } from "vitest";
import { GraphQLClient } from "graphql-request";
import { dataProvider } from "../../src/dataProvider";
import type { PostGraphileDataProvider } from "../../src/interfaces";

// Mock GraphQLClient
vi.mock("graphql-request");

describe("PostGraphile Data Provider - Contract Tests", () => {
  let mockClient: GraphQLClient;
  let provider: PostGraphileDataProvider;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock client
    mockClient = new GraphQLClient("https://api.example.com/graphql");

    // Create data provider
    provider = dataProvider(mockClient, {
      endpoint: "https://api.example.com/graphql",
    });
  });

  describe("Data Provider Interface Compliance", () => {
    it("should implement all required Refine data provider methods", () => {
      expect(provider.getList).toBeDefined();
      expect(typeof provider.getList).toBe("function");

      expect(provider.getMany).toBeDefined();
      expect(typeof provider.getMany).toBe("function");

      expect(provider.getOne).toBeDefined();
      expect(typeof provider.getOne).toBe("function");

      expect(provider.create).toBeDefined();
      expect(typeof provider.create).toBe("function");

      expect(provider.createMany).toBeDefined();
      expect(typeof provider.createMany).toBe("function");

      expect(provider.update).toBeDefined();
      expect(typeof provider.update).toBe("function");

      expect(provider.updateMany).toBeDefined();
      expect(typeof provider.updateMany).toBe("function");

      expect(provider.deleteOne).toBeDefined();
      expect(typeof provider.deleteOne).toBe("function");

      expect(provider.deleteMany).toBeDefined();
      expect(typeof provider.deleteMany).toBe("function");

      expect(provider.custom).toBeDefined();
      expect(typeof provider.custom).toBe("function");
    });

    it("should have PostGraphile-specific properties", () => {
      expect(provider.namingConvention).toBe("simplified");
      expect(provider.supportsConnectionFiltering).toBe(true);
      expect(provider.supportsSimplifyInflection).toBe(true);
    });
  });

  describe("getList Method Contract", () => {
    it("should return data and total count", async () => {
      // Mock the GraphQL response
      const mockResponse = {
        allUsers: {
          nodes: [
            { id: "1", name: "John Doe", email: "john@example.com" },
            { id: "2", name: "Jane Doe", email: "jane@example.com" },
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
        resource: "users",
        pagination: { current: 1, pageSize: 10 },
      };

      const result = await provider.getList(params);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it("should handle pagination parameters", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John Doe" }],
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
        pagination: { currentPage: 2, pageSize: 5 },
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          first: 5,
          // Note: Cursor calculation would be implemented
        })
      );
    });

    it("should handle sorting parameters", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John Doe" }],
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
        sorters: [{ field: "name", order: "asc" }],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          orderBy: ["name_ASC"],
        })
      );
    });

    it("should handle filter parameters", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", name: "John Doe" }],
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
        filters: [{ field: "name", operator: "contains", value: "John" }],
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("allUsers"),
        expect.objectContaining({
          filter: {
            name: { contains: "John" },
          },
        })
      );
    });

    it("should handle meta parameters for custom GraphQL", async () => {
      const mockResponse = {
        allUsers: {
          nodes: [{ id: "1", customField: "value" }],
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

      const customQuery = `
        query GetUsers {
          allUsers {
            nodes {
              id
              customField
            }
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `;

      const params = {
        resource: "users",
        meta: {
          gqlQuery: customQuery,
        },
      };

      await provider.getList(params);

      expect(mockClient.request).toHaveBeenCalledWith(customQuery, {});
    });

    it("should throw error on GraphQL request failure", async () => {
      const mockError = new Error("GraphQL request failed");
      mockClient.request = vi.fn().mockRejectedValue(mockError);

      const params = {
        resource: "users",
      };

      await expect(provider.getList(params)).rejects.toThrow();
    });
  });

  describe("getOne Method Contract", () => {
    it("should return single record data", async () => {
      const mockResponse = {
        userById: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        id: "1",
      };

      const result = await provider.getOne(params);

      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("id", "1");
      expect(result.data).toHaveProperty("name", "John Doe");
    });

    it("should handle meta parameters for field selection", async () => {
      const mockResponse = {
        userById: {
          id: "1",
          name: "John Doe",
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        id: "1",
        meta: {
          fields: ["id", "name"],
        },
      };

      await provider.getOne(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("id\n        name"),
        expect.objectContaining({ id: "1" })
      );
    });
  });

  describe("create Method Contract", () => {
    it("should return created record data", async () => {
      const mockResponse = {
        createuser: {
          data: {
            id: "3",
            name: "Bob Smith",
            email: "bob@example.com",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        variables: {
          name: "Bob Smith",
          email: "bob@example.com",
        },
      };

      const result = await provider.create(params);

      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("id", "3");
      expect(result.data).toHaveProperty("name", "Bob Smith");
    });
  });

  describe("update Method Contract", () => {
    it("should return updated record data", async () => {
      const mockResponse = {
        updateuser: {
          data: {
            id: "1",
            name: "John Updated",
            email: "john@example.com",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        id: "1",
        variables: {
          name: "John Updated",
        },
      };

      const result = await provider.update(params);

      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("id", "1");
      expect(result.data).toHaveProperty("name", "John Updated");
    });
  });

  describe("deleteOne Method Contract", () => {
    it("should return deleted record data", async () => {
      const mockResponse = {
        deleteuser: {
          data: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        id: "1",
      };

      const result = await provider.deleteOne(params);

      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("id", "1");
    });
  });
});
