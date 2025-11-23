import type { CrudFilter } from "@refinedev/core";
import type { FilterInput } from "../interfaces";

/**
 * Generates PostGraphile filter syntax from Refine filter data
 *
 * @param filters - Array of Refine filter data
 * @returns PostGraphile filter input object
 */
export function generateFilters(filters: CrudFilter[]): FilterInput {
  if (!filters || filters.length === 0) {
    return {};
  }

  const filterInput: FilterInput = {};

  filters.forEach(filter => {
    // Handle LogicalFilter (field-based filters)
    if ("field" in filter && "operator" in filter) {
      const { field, operator, value } = filter;
      const fieldFilter = generateFieldFilter(operator, value);
      if (fieldFilter) {
        (filterInput as any)[field] = fieldFilter;
      }
    }
    // Handle ConditionalFilter (and/or/not)
    else if ("operator" in filter && "value" in filter) {
      const { operator, value } = filter;
      if ((operator === "and" || operator === "or") && Array.isArray(value)) {
        if (operator === "and") {
          filterInput.and = value.map(f => generateFilters([f]));
        } else if (operator === "or") {
          filterInput.or = value.map(f => generateFilters([f]));
        }
      }
      // Note: "not" operator would be handled differently in ConditionalFilter
    }
  });

  return filterInput;
}

function generateFieldFilter(operator: string, value: any): any {
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
      return { contains: value };
    case "ncontains":
      return { notContains: value };
    case "containss":
      return { contains: value };
    case "ncontainss":
      return { notContains: value };
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
    // Add more operators as needed
    default:
      return { equalTo: value };
  }
}
