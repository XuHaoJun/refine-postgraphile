import { describe, it, expect } from "vitest";
import {
  generateUseListSubscription,
  generateUseManySubscription,
  generateUseOneSubscription,
} from "../../src/utils";

describe("generateUseListSubscription", () => {
  it("should generate basic list subscription query", () => {
    const result = generateUseListSubscription("users");

    expect(result).toContain('subscription usersListSubscription');
    expect(result).toContain('listen(topic: "users_changed")');
    expect(result).toContain("__typename");
  });

  it("should include filters in subscription query", () => {
    const filters = [
      { field: "active", operator: "eq", value: true },
      { field: "name", operator: "contains", value: "John" },
    ];

    const result = generateUseListSubscription("users", filters);

    expect(result).toContain('filter: { active: { equalTo: "true" }');
    expect(result).toContain('name: { includes: "John" }');
  });

  it("should handle empty filters array", () => {
    const result = generateUseListSubscription("users", []);

    expect(result).toContain('listen(topic: "users_changed")');
    expect(result).not.toContain("filter:");
  });

  it("should handle null/undefined filters", () => {
    const result = generateUseListSubscription("users", undefined);

    expect(result).toContain('listen(topic: "users_changed")');
    expect(result).not.toContain("filter:");
  });
});

describe("generateUseManySubscription", () => {
  it("should generate many subscription query with single ID", () => {
    const result = generateUseManySubscription("users", ["123"]);

    expect(result).toContain('subscription usersManySubscription');
    expect(result).toContain('listen(topic: "users_changed"');
    expect(result).toContain('filter: { id: { equalTo: "123" } }');
  });

  it("should generate many subscription query with multiple IDs", () => {
    const result = generateUseManySubscription("users", ["123", "456", "789"]);

    expect(result).toContain('subscription usersManySubscription');
    expect(result).toContain('filter: { id: { in: ["123", "456", "789"] } }');
  });

  it("should throw error for empty IDs array", () => {
    expect(() => {
      generateUseManySubscription("users", []);
    }).toThrow("At least one ID must be provided for useMany subscriptions");
  });
});

describe("generateUseOneSubscription", () => {
  it("should generate one subscription query", () => {
    const result = generateUseOneSubscription("users", "123");

    expect(result).toContain('subscription usersOneSubscription');
    expect(result).toContain('listen(topic: "users_changed"');
    expect(result).toContain('filter: { id: { equalTo: "123" } }');
  });

  it("should throw error for empty ID", () => {
    expect(() => {
      generateUseOneSubscription("users", "");
    }).toThrow("ID must be provided for useOne subscriptions");
  });
});
