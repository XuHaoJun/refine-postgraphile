/**
 * Generates GraphQL subscription for single record changes in PostGraphile
 *
 * This creates a subscription that listens for changes to a specific record by ID
 * using PostGraphile's @graphile/subscriptions plugin.
 *
 * @param resource - Resource name (table name)
 * @param id - Record ID to subscribe to
 * @returns GraphQL subscription string
 *
 * @example
 * ```typescript
 * const subscription = generateUseOneSubscription("users", "123");
 * // Returns: subscription usersOneSubscription { ... }
 * ```
 */
export function generateUseOneSubscription(
  resource: string,
  id: string
): string {
  if (!id) {
    throw new Error("ID must be provided for useOne subscriptions");
  }

  const operationName = `${resource}OneSubscription`;

  return `
    subscription ${operationName} {
      listen(topic: "${resource}_changed", filter: { id: { equalTo: "${id}" } }) {
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
