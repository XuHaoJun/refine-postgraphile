import type { CrudFilter, LogicalFilter } from "@refinedev/core";

/**
 * Generates GraphQL subscription for list changes in PostGraphile
 *
 * This creates a subscription that listens for INSERT, UPDATE, and DELETE events
 * on a table using PostGraphile's @graphile/subscriptions plugin.
 *
 * @param resource - Resource name (table name)
 * @param filters - Optional filters to narrow down the subscription scope
 * @returns GraphQL subscription string
 *
 * @example
 * ```typescript
 * const subscription = generateUseListSubscription("users", [
 *   { field: "active", operator: "eq", value: true }
 * ]);
 * // Returns: subscription usersListSubscription { ... }
 * ```
 */
export function generateUseListSubscription(
  resource: string,
  filters?: CrudFilter[]
): string {
  // PostGraphile subscriptions use the @graphile/subscriptions plugin
  // The subscription listens to table changes and filters can be applied
  const operationName = `${resource}ListSubscription`;

  // Generate filter conditions if provided
  let filterConditions = "";
  if (filters && filters.length > 0) {
    // Convert Refine filters to PostGraphile filter format
    // This is a simplified implementation - real filters would need more complex logic
    const filterExprs = filters
      .filter((filter): filter is LogicalFilter => "field" in filter)
      .map(filter => {
        const { field, operator, value } = filter;
      switch (operator) {
        case "eq":
          return `${field}: { equalTo: "${value}" }`;
        case "ne":
          return `${field}: { notEqualTo: "${value}" }`;
        case "lt":
          return `${field}: { lessThan: "${value}" }`;
        case "gt":
          return `${field}: { greaterThan: "${value}" }`;
        case "lte":
          return `${field}: { lessThanOrEqualTo: "${value}" }`;
        case "gte":
          return `${field}: { greaterThanOrEqualTo: "${value}" }`;
        case "contains":
          return `${field}: { includes: "${value}" }`;
        default:
          return `${field}: { equalTo: "${value}" }`;
      }
    });
    filterConditions = `filter: { ${filterExprs.join(", ")} }`;
  }

  return `
    subscription ${operationName} {
      listen(topic: "${resource}_changed"${filterConditions ? `, ${filterConditions}` : ""}) {
        event
        relatedNode {
          __typename
          id
          # Additional fields will be dynamically added based on schema introspection
        }
      }
    }
  `.trim();
}
