/**
 * Generates GraphQL subscription for multiple specific records changes in PostGraphile
 *
 * This creates a subscription that listens for changes to specific records by ID
 * using PostGraphile's @graphile/subscriptions plugin.
 *
 * @param resource - Resource name (table name)
 * @param ids - Array of record IDs to subscribe to
 * @returns GraphQL subscription string
 *
 * @example
 * ```typescript
 * const subscription = generateUseManySubscription("users", ["1", "2", "3"]);
 * // Returns: subscription usersManySubscription { ... }
 * ```
 */
export function generateUseManySubscription(
  resource: string,
  ids: string[]
): string {
  if (!ids || ids.length === 0) {
    throw new Error("At least one ID must be provided for useMany subscriptions");
  }

  const operationName = `${resource}ManySubscription`;

  // Create filter for specific IDs
  const idFilter = ids.length === 1
    ? `id: { equalTo: "${ids[0]}" }`
    : `id: { in: [${ids.map(id => `"${id}"`).join(", ")}] }`;

  return `
    subscription ${operationName} {
      listen(topic: "${resource}_changed", filter: { ${idFilter} }) {
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
