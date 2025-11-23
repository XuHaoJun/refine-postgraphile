import type { BaseRecord, DataProvider } from "@refinedev/core";

/**
 * PostGraphile-specific data provider interface extending Refine's base DataProvider
 */
export interface PostGraphileDataProvider extends DataProvider {
  /**
   * PostGraphile-specific configuration
   */
  readonly namingConvention: "simplified" | "default";
  readonly supportsConnectionFiltering: boolean;
  readonly supportsSimplifyInflection: boolean;
}

/**
 * Configuration options for the PostGraphile data provider
 */
export interface PostGraphileDataProviderConfig {
  /**
   * HTTP headers to include in requests
   */
  headers?: Record<string, string>;

  /**
   * Field naming convention used by PostGraphile
   * @default "simplified"
   */
  namingConvention?: "simplified" | "default";

  /**
   * Connection filter plugin configuration
   */
  filterOptions?: FilterOptions;

  /**
   * Enable schema introspection for dynamic fields
   * @default false
   */
  schemaIntrospection?: boolean;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Retry configuration
   */
  retry?: {
    /** Maximum number of retries */
    attempts?: number;
    /** Delay between retries in milliseconds */
    delay?: number;
  };
}

/**
 * Filter options for postgraphile-plugin-connection-filter
 */
export interface FilterOptions {
  /**
   * Allow null literals in filter inputs
   * @default false
   */
  allowNullInput?: boolean;

  /**
   * Allow empty objects in filter inputs
   * @default false
   */
  allowEmptyObjectInput?: boolean;

  /**
   * Restrict allowed filter operators
   */
  allowedOperators?: string[];

  /**
   * Restrict filtering to specific field types
   */
  allowedFieldTypes?: string[];
}

import type { MetaQuery } from "@refinedev/core";

/**
 * GraphQL operation metadata for Refine (extends core MetaQuery)
 */
export interface GraphQLOperationMeta extends MetaQuery {
  /**
   * Operation name
   */
  operation?: string;
}

/**
 * PostGraphile Relay Connection type
 */
export interface Connection<T = BaseRecord> {
  edges: Edge<T>[];
  nodes: T[];
  pageInfo: PageInfo;
  totalCount?: number;
}

/**
 * PostGraphile Relay Edge type
 */
export interface Edge<T = BaseRecord> {
  cursor: string;
  node: T;
}

/**
 * PostGraphile Relay PageInfo type
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * Filter input for PostGraphile connection filtering
 */
export interface FilterInput {
  and?: FilterInput[];
  or?: FilterInput[];
  not?: FilterInput;
  [fieldName: string]: any;
}

/**
 * Sorting input for PostGraphile
 */
export interface SortingInput {
  field: string;
  order: "ASC" | "DESC";
}

/**
 * Pagination input for PostGraphile Relay connections
 */
export interface PaginationInput {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

/**
 * PostGraphile create mutation input
 */
export interface CreateInput<T = BaseRecord> {
  object: T;
  clientMutationId?: string;
}

/**
 * PostGraphile update mutation input
 */
export interface UpdateInput<T = BaseRecord> {
  id: string | number;
  object: Partial<T>;
  clientMutationId?: string;
}

/**
 * PostGraphile delete mutation input
 */
export interface DeleteInput {
  id: string | number;
  clientMutationId?: string;
}

/**
 * PostGraphile mutation payload
 */
export interface MutationPayload<T = BaseRecord> {
  data: T;
  clientMutationId?: string;
  query?: BaseRecord;
}

/**
 * GraphQL error from PostGraphile
 */
export interface GraphQLError {
  message: string;
  locations?: GraphQLLocation[];
  path?: (string | number)[];
  extensions?: Record<string, any>;
}

/**
 * GraphQL location for error reporting
 */
export interface GraphQLLocation {
  line: number;
  column: number;
}

/**
 * GraphQL response wrapper
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

/**
 * Extract the item type from a GraphQL list query result
 * Handles both PostGraphile Relay connections and simplified arrays
 */
export type GetFieldsFromList<T extends Record<string, any>> = {
  [K in keyof T]: // Handle Relay connections with edges
  T[K] extends { edges: Array<{ node: infer U }> }
    ? U
    : // Handle Relay connections with nodes
    T[K] extends { nodes: Array<infer U> }
    ? U
    : // Handle simplified arrays
    T[K] extends Array<infer U>
    ? U
    : never;
}[keyof T];

/**
 * Extract fields from a GraphQL query or mutation result
 */
export type GetFields<T extends Record<any, any>, K = keyof T> = {
  [P in keyof NonNullable<T[K]>]: NonNullable<T[K]>[P];
};

/**
 * Extract variables from mutation inputs
 */
export type GetVariables<T extends Record<any, any>> =
  | GetFields<T, "input">
  | GetFields<T, "object">;
