import type {
  LiveProvider,
  LiveEvent,
  LiveCommonParams,
  LiveListParams,
  LiveOneParams,
  LiveManyParams
} from "@refinedev/core";

/**
 * Subscription options for the live provider
 */
type LiveSubscribeOptions = {
  channel: string;
  types: Array<LiveEvent["type"]>;
  callback: (event: LiveEvent) => void;
  params?: LiveCommonParams & LiveListParams & LiveOneParams & LiveManyParams;
  meta?: any;
};
import type { GraphQLClient } from "graphql-request";
import { createClient, Client as GraphQLWSClient } from "graphql-ws";
// Note: WebSocket is dynamically imported to avoid bundling issues in browser environments
import {
  generateUseListSubscription,
  generateUseManySubscription,
  generateUseOneSubscription,
} from "../utils";

/**
 * Configuration for the PostGraphile live provider
 */
export interface PostGraphileLiveProviderConfig {
  /**
   * WebSocket URL for GraphQL subscriptions
   * If not provided, will be derived from the GraphQL client's endpoint
   */
  wsUrl?: string;

  /**
   * Headers to include in WebSocket connection
   */
  headers?: Record<string, string>;

  /**
   * Connection timeout in milliseconds
   * @default 30000
   */
  connectionTimeout?: number;

  /**
   * Reconnection settings
   */
  reconnection?: {
    /**
     * Whether to enable automatic reconnection
     * @default true
     */
    enabled?: boolean;

    /**
     * Initial delay before reconnection attempt (ms)
     * @default 1000
     */
    initialDelay?: number;

    /**
     * Maximum delay between reconnection attempts (ms)
     * @default 30000
     */
    maxDelay?: number;

    /**
     * Backoff multiplier for reconnection delay
     * @default 2
     */
    backoffMultiplier?: number;
  };

  /**
   * Enable debug logging for subscriptions
   * @default false
   */
  debug?: boolean;
}

/**
 * Creates a live provider for PostGraphile real-time subscriptions
 *
 * This provider enables real-time data synchronization by establishing GraphQL
 * subscriptions over WebSocket connections to PostGraphile's subscription endpoint.
 *
 * @param client - GraphQL client instance for HTTP requests
 * @param config - Configuration options for the live provider
 * @returns Live provider instance for Refine
 *
 * @example
 * ```typescript
 * import { Refine } from "@refinedev/core";
 * import { dataProvider, liveProvider } from "@refinedev/postgraphile";
 * import { GraphQLClient } from "graphql-request";
 *
 * const client = new GraphQLClient("https://api.example.com/graphql");
 * const wsUrl = "wss://api.example.com/graphql";
 *
 * const App = () => (
 *   <Refine
 *     dataProvider={dataProvider(client)}
 *     liveProvider={liveProvider(client, { wsUrl })}
 *     // ... other props
 *   />
 * );
 * ```
 */
export function liveProvider(
  client: GraphQLClient,
  config: PostGraphileLiveProviderConfig = {}
): LiveProvider {
  const {
    wsUrl,
    headers = {},
    connectionTimeout = 30000,
    reconnection = {
      enabled: true,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
    debug = false,
  } = config;

  // Derive WebSocket URL from GraphQL endpoint if not provided
  const derivedWsUrl = wsUrl || getWebSocketUrl(client);

  // Active subscriptions map (subscriptionId -> cleanup function)
  const subscriptions = new Map<string, () => void>();

  // WebSocket client instance
  let wsClient: GraphQLWSClient | null = null;

  /**
   * Initialize WebSocket client if not already created
   */
  const getWSClient = async (): Promise<GraphQLWSClient> => {
    if (!wsClient) {
      // Dynamically import WebSocket to avoid bundling issues
      const WebSocket = (await import("ws")).default;

      wsClient = createClient({
        url: derivedWsUrl,
        webSocketImpl: WebSocket,
        connectionParams: {
          headers,
        },
        retryAttempts: reconnection.enabled ? Infinity : 0,
        retryWait: async (retries) => {
          const delay = Math.min(
            reconnection.initialDelay! * Math.pow(reconnection.backoffMultiplier!, retries),
            reconnection.maxDelay!
          );
          if (debug) {
            console.debug(`[PostGraphile Live] Reconnecting in ${delay}ms (attempt ${retries + 1})`);
          }
          // Wait for the delay
          await new Promise(resolve => setTimeout(resolve, delay));
        },
        on: {
          connected: () => {
            if (debug) {
              console.debug("[PostGraphile Live] WebSocket connected");
            }
          },
          closed: () => {
            if (debug) {
              console.debug("[PostGraphile Live] WebSocket closed");
            }
          },
          error: (error) => {
            console.error("[PostGraphile Live] WebSocket error:", error);
          },
        },
      });
    }
    return wsClient;
  };

  return {
    /**
     * Subscribe to real-time data changes for a specific resource and event types
     *
     * @param options - Subscription options including channel, types, callback, and params
     * @returns Subscription identifier for unsubscribing
     */
    subscribe: async (options: LiveSubscribeOptions): Promise<string> => {
      const { channel, types, callback, params, meta } = options;
      const { subscriptionType, resource } = params || {};
      const subscriptionId = `${channel}_${Date.now()}_${Math.random()}`;

      try {
        let subscriptionQuery: string;

        // Generate appropriate subscription query based on type
        switch (subscriptionType) {
          case "useList":
            const listParams = params as LiveListParams;
            subscriptionQuery = generateUseListSubscription(
              resource || channel,
              listParams?.filters
            );
            break;
          case "useMany":
            const manyParams = params as LiveManyParams;
            if (!manyParams.ids || manyParams.ids.length === 0) {
              throw new Error("ids parameter is required for useMany subscriptions");
            }
            subscriptionQuery = generateUseManySubscription(
              resource || channel,
              manyParams.ids as string[]
            );
            break;
          case "useOne":
            const oneParams = params as LiveOneParams;
            if (!oneParams.id) {
              throw new Error("id parameter is required for useOne subscriptions");
            }
            subscriptionQuery = generateUseOneSubscription(
              resource || channel,
              oneParams.id as string
            );
            break;
          default:
            // Fallback to list subscription if no specific type
            subscriptionQuery = generateUseListSubscription(resource || channel);
        }

        if (debug) {
          console.debug(`[PostGraphile Live] Subscribing to ${subscriptionType || 'unknown'} for ${resource || channel}`, {
            subscriptionId,
            channel,
            types,
            query: subscriptionQuery,
          });
        }

        // Create subscription
        const wsClient = await getWSClient();
        const unsubscribe = wsClient.subscribe(
          {
            query: subscriptionQuery,
            variables: meta?.variables || {},
          },
          {
            next: (data: any) => {
              try {
                // Transform PostGraphile subscription data to Refine LiveEvent
                const liveEvents = transformSubscriptionData(data, resource || channel, types);
                liveEvents.forEach(liveEvent => callback(liveEvent));
              } catch (error) {
                console.error("[PostGraphile Live] Error processing subscription data:", error);
              }
            },
            error: (error) => {
              console.error(`[PostGraphile Live] Subscription error for ${subscriptionId}:`, error);
              // Emit error event for each requested type
              types.forEach((eventType: LiveEvent["type"]) => {
                callback({
                  channel,
                  type: "error",
                  payload: {
                    error: (error as Error).message || "Subscription error",
                    resource: resource || channel,
                  },
                  date: new Date(),
                  meta,
                });
              });
            },
            complete: () => {
              if (debug) {
                console.debug(`[PostGraphile Live] Subscription completed for ${subscriptionId}`);
              }
            },
          }
        );

        // Store cleanup function
        subscriptions.set(subscriptionId, unsubscribe);

        return subscriptionId;
      } catch (error) {
        console.error("[PostGraphile Live] Failed to create subscription:", error);
        throw error;
      }
    },

    /**
     * Unsubscribe from a specific subscription
     *
     * @param subscriptionId - ID of the subscription to cancel
     */
    unsubscribe: (subscriptionId: string): void => {
      const cleanup = subscriptions.get(subscriptionId);
      if (cleanup) {
        if (debug) {
          console.debug(`[PostGraphile Live] Unsubscribing ${subscriptionId}`);
        }
        cleanup();
        subscriptions.delete(subscriptionId);
      } else {
        console.warn(`[PostGraphile Live] No active subscription found for ${subscriptionId}`);
      }
    },

    /**
     * Publish a data change event (not supported by PostGraphile subscriptions)
     *
     * PostGraphile subscriptions are read-only and listen for database changes.
     * Publishing events would require server-side mutations, which is not supported
     * through this live provider.
     *
     * @param event - Event to publish (ignored)
     */
    publish: (event: LiveEvent): void => {
      console.warn(
        "[PostGraphile Live] Publish operation not supported. " +
        "PostGraphile live provider only supports subscribing to database changes."
      );
    },

  };
}

/**
 * Transform PostGraphile subscription data to Refine LiveEvent format
 */
function transformSubscriptionData(
  data: any,
  channel: string,
  types: Array<LiveEvent["type"]>
): LiveEvent[] {
  try {
    // PostGraphile subscriptions typically have this structure:
    // { listen: { relatedNode: { __typename, id, ... }, event: "INSERT|UPDATE|DELETE" } }

    const listenData = data?.listen;
    if (!listenData) {
      return [];
    }

    const { relatedNode, event } = listenData;
    if (!relatedNode || !event) {
      return [];
    }

    // Map PostGraphile events to Refine live event types
    let liveEventType: LiveEvent["type"];
    switch (event.toUpperCase()) {
      case "INSERT":
        liveEventType = "created";
        break;
      case "UPDATE":
        liveEventType = "updated";
        break;
      case "DELETE":
        liveEventType = "deleted";
        break;
      default:
        console.warn(`[PostGraphile Live] Unknown event type: ${event}`);
        return [];
    }

    // Only emit event if it's in the requested types or if "*" is requested
    if (!types.includes(liveEventType) && !types.includes("*")) {
      return [];
    }

    const liveEvent: LiveEvent = {
      channel,
      type: liveEventType,
      payload: {
        ids: relatedNode.id ? [relatedNode.id] : [],
        ...relatedNode, // Include all fields from the related node
      },
      date: new Date(),
    };

    return [liveEvent];
  } catch (error) {
    console.error("[PostGraphile Live] Error transforming subscription data:", error);
    return [];
  }
}

/**
 * Derive WebSocket URL from GraphQL HTTP endpoint
 */
function getWebSocketUrl(client: GraphQLClient): string {
  // This is a simplified implementation. In a real scenario, you might need
  // to inspect the client's configuration or provide the WebSocket URL explicitly.

  // For now, we'll make a reasonable assumption:
  // - HTTP endpoints become WS endpoints
  // - HTTPS endpoints become WSS endpoints

  // Note: This is a placeholder. In practice, you should configure the wsUrl explicitly
  // since the client doesn't expose its endpoint URL directly.

  throw new Error(
    "WebSocket URL must be explicitly provided in liveProvider config. " +
    "Cannot derive from GraphQL client."
  );
}
