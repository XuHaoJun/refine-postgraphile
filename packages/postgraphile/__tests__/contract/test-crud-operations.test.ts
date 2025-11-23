import { describe, it, expect, beforeEach, vi } from "vitest";
import { GraphQLClient } from "graphql-request";
import { dataProvider } from "../../src/dataProvider";
import type { PostGraphileDataProvider } from "../../src/interfaces";

// Mock GraphQLClient
vi.mock("graphql-request");

describe("PostGraphile Data Provider - CRUD Operations Contract Tests", () => {
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

  describe("create Method Contract", () => {
    it("should create a single record and return created data", async () => {
      const mockResponse = {
        createuser: {
          data: {
            id: "3",
            name: "Bob Smith",
            email: "bob@example.com",
            createdAt: "2023-11-23T10:00:00Z",
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
      expect(result.data).toHaveProperty("email", "bob@example.com");
    });

    it("should handle create with custom meta fields", async () => {
      const mockResponse = {
        createpost: {
          data: {
            id: "5",
            title: "New Post",
            content: "Post content",
            authorId: "1",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "posts",
        variables: {
          title: "New Post",
          content: "Post content",
          authorId: "1",
        },
        meta: {
          fields: ["id", "title", "content", "authorId"],
        },
      };

      await provider.create(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("mutation Createpost"),
        expect.objectContaining({
          input: {
            object: {
              title: "New Post",
              content: "Post content",
              authorId: "1",
            },
          },
        })
      );
    });

    it("should throw error on GraphQL mutation failure", async () => {
      const mockError = new Error("GraphQL mutation failed");
      mockClient.request = vi.fn().mockRejectedValue(mockError);

      const params = {
        resource: "users",
        variables: {
          name: "Test User",
        },
      };

      await expect(provider.create(params)).rejects.toThrow("GraphQL mutation failed");
    });
  });

  describe("createMany Method Contract", () => {
    it("should create multiple records and return created data array", async () => {
      // Mock multiple calls to create
      mockClient.request = vi.fn()
        .mockResolvedValueOnce({
          createuser: {
            data: {
              id: "3",
              name: "Bob Smith",
              email: "bob@example.com",
            },
          },
        })
        .mockResolvedValueOnce({
          createuser: {
            data: {
              id: "4",
              name: "Alice Johnson",
              email: "alice@example.com",
            },
          },
        });

      const params = {
        resource: "users",
        variables: [
          {
            name: "Bob Smith",
            email: "bob@example.com",
          },
          {
            name: "Alice Johnson",
            email: "alice@example.com",
          },
        ],
      };

      const result = await provider.createMany!(params);

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty("id", "3");
      expect(result.data[1]).toHaveProperty("id", "4");
    });

    it("should handle empty array input", async () => {
      const params = {
        resource: "users",
        variables: [],
      };

      const result = await provider.createMany!(params);

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("update Method Contract", () => {
    it("should update a single record and return updated data", async () => {
      const mockResponse = {
        updateUserById: {
          data: {
            id: "1",
            name: "John Updated",
            email: "john@example.com",
            updatedAt: "2023-11-23T11:00:00Z",
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

    it("should handle update with primary key in variables", async () => {
      const mockResponse = {
        updateUserById: {
          data: {
            id: "1",
            name: "John Doe",
            email: "john.updated@example.com",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "users",
        id: "1",
        variables: {
          id: "1",
          email: "john.updated@example.com",
        },
      };

      await provider.update(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("mutation UpdateUser"),
        expect.objectContaining({
          input: {
            id: "1",
            object: {
              email: "john.updated@example.com",
            },
          },
        })
      );
    });

    it("should throw error on update failure", async () => {
      const mockError = new Error("Record not found");
      mockClient.request = vi.fn().mockRejectedValue(mockError);

      const params = {
        resource: "users",
        id: "999",
        variables: {
          name: "Updated Name",
        },
      };

      await expect(provider.update(params)).rejects.toThrow("Record not found");
    });
  });

  describe("updateMany Method Contract", () => {
    it("should update multiple records and return updated data array", async () => {
      // Mock multiple calls to update
      mockClient.request = vi.fn()
        .mockResolvedValueOnce({
          updateUserById: {
            data: {
              id: "1",
              name: "John Doe",
              status: "active",
            },
          },
        })
        .mockResolvedValueOnce({
          updateUserById: {
            data: {
              id: "2",
              name: "Jane Doe",
              status: "active",
            },
          },
        });

      const params = {
        resource: "users",
        ids: ["1", "2"],
        variables: {
          status: "active",
        },
      };

      const result = await provider.updateMany!(params);

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty("status", "active");
      expect(result.data[1]).toHaveProperty("status", "active");
    });

    it("should throw error for updateMany with filters (requires custom schema)", async () => {
      const params = {
        resource: "users",
        ids: [],
        variables: {
          status: "inactive",
        },
        filters: [
          { field: "status", operator: "eq", value: "active" },
        ],
      };

      await expect(provider.updateMany!(params)).rejects.toThrow(
        "Bulk update operations with filters require custom PostGraphile schema extensions"
      );
    });
  });

  describe("deleteOne Method Contract", () => {
    it("should delete a single record and return deleted data", async () => {
      const mockResponse = {
        deleteUserById: {
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
      expect(result.data).toHaveProperty("name", "John Doe");
    });

    it("should handle delete with custom meta", async () => {
      const mockResponse = {
        deletePostById: {
          data: {
            id: "5",
            title: "Post to Delete",
          },
        },
      };

      mockClient.request = vi.fn().mockResolvedValue(mockResponse);

      const params = {
        resource: "posts",
        id: "5",
        meta: {
          fields: ["id", "title"],
        },
      };

      await provider.deleteOne(params);

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining("mutation DeletePost"),
        expect.objectContaining({
          input: {
            id: "5",
          },
        })
      );
    });

    it("should throw error on delete failure", async () => {
      const mockError = new Error("Record not found or cannot be deleted");
      mockClient.request = vi.fn().mockRejectedValue(mockError);

      const params = {
        resource: "users",
        id: "999",
      };

      await expect(provider.deleteOne(params)).rejects.toThrow("Record not found or cannot be deleted");
    });
  });

  describe("deleteMany Method Contract", () => {
    it("should delete multiple records and return deleted data array", async () => {
      // Mock multiple calls to deleteOne
      mockClient.request = vi.fn()
        .mockResolvedValueOnce({
          deleteUserById: {
            data: {
              id: "1",
              name: "John Doe",
            },
          },
        })
        .mockResolvedValueOnce({
          deleteUserById: {
            data: {
              id: "2",
              name: "Jane Doe",
            },
          },
        });

      const params = {
        resource: "users",
        ids: ["1", "2"],
      };

      const result = await provider.deleteMany!(params);

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty("id", "1");
      expect(result.data[1]).toHaveProperty("id", "2");
    });

    it("should throw error for deleteMany with filters (requires custom schema)", async () => {
      const params = {
        resource: "users",
        ids: [],
        filters: [
          { field: "status", operator: "eq", value: "inactive" },
        ],
      };

      await expect(provider.deleteMany!(params)).rejects.toThrow(
        "Bulk delete operations with filters require custom PostGraphile schema extensions"
      );
    });
  });
});
