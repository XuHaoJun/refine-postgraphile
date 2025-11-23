import { describe, it, expect } from "vitest";
import { generateSorting } from "../../src/utils";

describe("generateSorting", () => {
  it("should generate empty array for empty sorters", () => {
    const result = generateSorting([]);

    expect(result).toEqual([]);
  });

  it("should generate empty array for null/undefined sorters", () => {
    const result = generateSorting(undefined);

    expect(result).toEqual([]);
  });

  it("should generate sorting string for single sorter", () => {
    const sorters = [{ field: "name", order: "asc" as const }];

    const result = generateSorting(sorters);

    expect(result).toEqual(["name_ASC"]);
  });

  it("should generate sorting strings for multiple sorters", () => {
    const sorters = [
      { field: "name", order: "asc" as const },
      { field: "createdAt", order: "desc" as const },
      { field: "email", order: "asc" as const },
    ];

    const result = generateSorting(sorters);

    expect(result).toEqual(["name_ASC", "createdAt_DESC", "email_ASC"]);
  });

  it("should handle desc order correctly", () => {
    const sorters = [{ field: "priority", order: "desc" as const }];

    const result = generateSorting(sorters);

    expect(result).toEqual(["priority_DESC"]);
  });
});
