import type { CrudFilter } from "@refinedev/core";
import type { FilterInput, FilterOptions } from "../interfaces";

/**
 * Performance optimization hints and metadata
 */
export interface PerformanceHints {
  /** Estimated query complexity score (0-100) */
  complexity: number;
  /** Recommended optimizations */
  suggestions: string[];
  /** Whether query should be cached */
  cacheable: boolean;
  /** Estimated result size */
  estimatedSize: "small" | "medium" | "large";
}

/**
 * Generates PostGraphile filter syntax from Refine filter data
 *
 * @param filters - Array of Refine filter data
 * @param options - Filter validation and security options
 * @returns PostGraphile filter input object
 */
export function generateFilters(
  filters: CrudFilter[],
  options?: FilterOptions
): FilterInput {
  if (!filters || filters.length === 0) {
    return {};
  }

  // Always perform basic security validation
  validateFiltersBasic(filters);

  // Validate filters against security restrictions
  validateFilters(filters, options);

  const filterInput: FilterInput = {};

  filters.forEach((filter) => {
    // Handle LogicalFilter (field-based filters)
    if ("field" in filter && "operator" in filter) {
      const { field, operator, value } = filter;

      // Validate field name for security
      validateFieldName(field);

      const fieldFilter = generateFieldFilter(operator, value, options);
      if (fieldFilter) {
        if ((filterInput as any)[field]) {
          // Merge filters for the same field
          (filterInput as any)[field] = {
            ...(filterInput as any)[field],
            ...fieldFilter,
          };
        } else {
          (filterInput as any)[field] = fieldFilter;
        }
      }
    }
    // Handle ConditionalFilter (and/or/not)
    else if ("operator" in filter && "value" in filter) {
      const { operator, value } = filter;
      if ((operator === "and" || operator === "or") && Array.isArray(value)) {
        if (operator === "and") {
          filterInput.and = value.map((f) => generateFilters([f], options));
        } else if (operator === "or") {
          filterInput.or = value.map((f) => generateFilters([f], options));
        }
      }
      // Note: "not" operator would be handled differently in ConditionalFilter
    }
  });

  return filterInput;
}

function generateFieldFilter(
  operator: string,
  value: any,
  options?: FilterOptions
): any {
  // Skip text operators with empty string values (they match everything)
  const textOperators = [
    "contains",
    "ncontains",
    "containss",
    "ncontainss",
    "startswith",
    "nstartswith",
    "endswith",
    "nendswith",
  ];
  if (
    textOperators.includes(operator) &&
    (value === "" || value === null || value === undefined)
  ) {
    return null;
  }

  switch (operator) {
    case "eq":
      return { equalTo: value };
    case "ne":
      return { notEqualTo: value };
    case "lt":
      return { lessThan: value };
    case "gt":
      return { greaterThan: value };
    case "lte":
      return { lessThanOrEqualTo: value };
    case "gte":
      return { greaterThanOrEqualTo: value };
    case "in":
      return { in: value };
    case "nin":
      return { notIn: value };
    case "contains":
      // For string values, use 'includes' (case-sensitive string substring)
      // For object/array values, use 'contains' (JSONB/Array/HStore containment)
      if (typeof value === "string") {
        return { includes: value };
      } else {
        // Object or array - use PostGraphile's contains for JSONB/Array/HStore
        return { contains: value };
      }
    case "ncontains":
      // For string values, use 'notIncludes' (case-sensitive)
      // For object/array values, use 'notContains' (JSONB/Array/HStore)
      if (typeof value === "string") {
        return { notIncludes: value };
      } else {
        return { notContains: value };
      }
    case "containss":
      // For string fields, use 'includesInsensitive' (case-insensitive)
      // containss is always for strings (case-insensitive variant)
      return { includesInsensitive: value };
    case "ncontainss":
      // For string fields, use 'notIncludesInsensitive' (case-insensitive)
      // ncontainss is always for strings (case-insensitive variant)
      return { notIncludesInsensitive: value };
    case "null":
      return { isNull: value };
    case "nnull":
      return { isNull: !value };
    case "startswith":
      return { startsWith: value };
    case "nstartswith":
      return { notStartsWith: value };
    case "endswith":
      return { endsWith: value };
    case "nendswith":
      return { notEndsWith: value };
    // PostgreSQL Array operators
    case "containedBy":
      return { containedBy: value };
    case "overlaps":
      return { overlaps: value };
    // PostgreSQL JSONB operators
    case "hasKey":
      return { hasKey: value };
    // Add more operators as needed
    default:
      return { equalTo: value };
  }
}

/**
 * Performs basic security validation that always runs
 */
function validateFiltersBasic(filters: CrudFilter[]): void {
  filters.forEach((filter) => {
    if ("field" in filter) {
      validateFieldName(filter.field);
    }

    if ("operator" in filter) {
      validateOperatorValue(filter.operator, filter.value);
    }

    // Recursively validate nested filters
    if ("value" in filter && Array.isArray(filter.value)) {
      filter.value.forEach((nestedFilter) => {
        if (typeof nestedFilter === "object" && nestedFilter !== null) {
          validateFiltersBasic([nestedFilter as CrudFilter]);
        }
      });
    }
  });
}

/**
 * Validates filters against security restrictions
 */
function validateFilters(filters: CrudFilter[], options?: FilterOptions): void {
  if (!options) return;

  const { allowedOperators, allowNullInput, allowEmptyObjectInput } = options;

  filters.forEach((filter) => {
    if ("operator" in filter) {
      // Check if operator is allowed
      if (allowedOperators && !allowedOperators.includes(filter.operator)) {
        throw new Error(
          `Filter operator '${
            filter.operator
          }' is not allowed. Allowed operators: ${allowedOperators.join(", ")}`
        );
      }

      // Validate null input restrictions
      if (!allowNullInput && filter.value === null) {
        throw new Error("Null values are not allowed in filter inputs");
      }

      // Validate empty object restrictions
      if (
        !allowEmptyObjectInput &&
        typeof filter.value === "object" &&
        filter.value !== null &&
        Object.keys(filter.value).length === 0
      ) {
        throw new Error("Empty objects are not allowed in filter inputs");
      }

      // Additional security validations
      validateOperatorValue(filter.operator, filter.value);
    }

    // Recursively validate nested filters
    if ("value" in filter && Array.isArray(filter.value)) {
      filter.value.forEach((nestedFilter) => {
        if (typeof nestedFilter === "object" && nestedFilter !== null) {
          validateFilters([nestedFilter as CrudFilter], options);
        }
      });
    }
  });
}

/**
 * Validates field name for security (prevents injection)
 */
function validateFieldName(field: string): void {
  // Basic validation to prevent common injection patterns
  if (!field || typeof field !== "string") {
    throw new Error("Field name must be a non-empty string");
  }

  // Prevent field names that could be used for GraphQL injection
  if (field.includes("__") || field.startsWith("_")) {
    throw new Error(
      `Field name '${field}' is not allowed (reserved GraphQL introspection fields)`
    );
  }

  // Prevent field names with suspicious characters
  if (/[<>'"&]/.test(field)) {
    throw new Error(`Field name '${field}' contains invalid characters`);
  }

  // Limit field name length
  if (field.length > 100) {
    throw new Error("Field name is too long (maximum 100 characters)");
  }
}

/**
 * Validates operator values for security
 */
function validateOperatorValue(operator: string, value: any): void {
  // Prevent extremely large arrays that could cause performance issues
  if (Array.isArray(value) && value.length > 1000) {
    throw new Error(`Array filter values are too large (maximum 1000 items)`);
  }

  // Prevent extremely long string values
  if (typeof value === "string" && value.length > 10000) {
    throw new Error(
      "String filter values are too long (maximum 10000 characters)"
    );
  }

  // Prevent deeply nested objects that could cause issues
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const depth = getObjectDepth(value);
    if (depth > 10) {
      throw new Error(
        "Filter object values are too deeply nested (maximum depth 10)"
      );
    }
  }
}

/**
 * Gets the maximum depth of a nested object
 */
function getObjectDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return currentDepth;
  }

  let maxDepth = currentDepth;
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) {
      const depth = getObjectDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

/**
 * Analyzes query performance and provides optimization hints
 */
export function analyzeQueryPerformance(
  filters: CrudFilter[],
  pagination?: { pageSize?: number },
  sorters?: any[],
  fields?: string[]
): PerformanceHints {
  let complexity = 0;
  const suggestions: string[] = [];
  let cacheable = true;
  let estimatedSize: "small" | "medium" | "large" = "small";

  // Analyze filter complexity
  const filterCount = filters.length;
  const logicalOperators = filters.filter(
    (f) => "operator" in f && ["and", "or"].includes(f.operator)
  ).length;
  const nestedDepth =
    filterCount > 0 ? Math.max(...filters.map((f) => getFilterDepth(f))) : 0;

  complexity += filterCount * 3; // Base complexity per filter
  complexity += logicalOperators * 8; // Logical operators are more expensive
  complexity += nestedDepth * 5; // Nested filters increase complexity

  // Analyze pagination
  const pageSize = pagination?.pageSize || 10;
  if (pageSize > 100) {
    complexity += 15;
    suggestions.push("Consider reducing page size for better performance");
  } else if (pageSize > 50) {
    complexity += 8;
  }

  // Analyze sorting
  const sortCount = sorters?.length || 0;
  complexity += sortCount * 2;

  // Analyze field selection
  const fieldCount = fields?.length || 1;
  if (fieldCount > 20) {
    complexity += 8;
    suggestions.push("Selecting many fields may impact performance");
  }

  // Determine cacheability
  const hasDynamicFilters = filters.some(
    (f) =>
      "operator" in f &&
      ["contains", "containss", "startswith", "endswith"].includes(f.operator)
  );
  if (hasDynamicFilters) {
    cacheable = false;
    suggestions.push("Dynamic text filters prevent query caching");
  }

  // Estimate result size
  if (filterCount === 0 && pageSize >= 100) {
    estimatedSize = "large";
  } else if (
    (filterCount === 0 && pageSize >= 50) ||
    (filterCount <= 2 && pageSize >= 25)
  ) {
    estimatedSize = "medium";
  }

  // Performance suggestions based on complexity
  if (complexity > 50) {
    suggestions.unshift(
      "High complexity query detected - consider adding database indexes"
    );
  }
  if (complexity > 30) {
    suggestions.push(
      "Consider using more specific filters to reduce result set"
    );
  }

  // Cap complexity at 100
  complexity = Math.min(complexity, 100);

  return {
    complexity,
    suggestions,
    cacheable,
    estimatedSize,
  };
}

/**
 * Gets the maximum nesting depth of a filter
 */
function getFilterDepth(filter: CrudFilter): number {
  if (!("value" in filter) || !Array.isArray(filter.value)) {
    return 0;
  }

  return (
    1 +
    Math.max(
      ...filter.value.map((f) =>
        typeof f === "object" && f !== null
          ? getFilterDepth(f as CrudFilter)
          : 0
      )
    )
  );
}
