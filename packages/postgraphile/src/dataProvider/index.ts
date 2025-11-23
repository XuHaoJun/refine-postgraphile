import type { GraphQLClient } from "graphql-request";
import type {
  PostGraphileDataProvider,
  PostGraphileDataProviderConfig,
  GraphQLOperationMeta,
} from "../interfaces";
import type {
  GetListParams,
  GetListResponse,
  GetManyParams,
  GetManyResponse,
  GetOneParams,
  GetOneResponse,
  CreateParams,
  CreateResponse,
  CreateManyParams,
  CreateManyResponse,
  UpdateParams,
  UpdateResponse,
  UpdateManyParams,
  UpdateManyResponse,
  DeleteOneParams,
  DeleteOneResponse,
  DeleteManyParams,
  DeleteManyResponse,
  CustomParams,
  CustomResponse,
  BaseRecord,
  CrudFilter,
  CrudSort,
  MetaQuery,
  Pagination,
} from "@refinedev/core";
import { handleGraphQLError } from "../utils/errors";
import { generateFilters, analyzeQueryPerformance } from "../utils/generateFilters";
import { generateSorting } from "../utils/generateSorting";
import { buildGraphQLQuery } from "../utils/graphql";

/**
 * Creates a PostGraphile data provider for Refine
 *
 * @param client - GraphQL client instance
 * @param config - PostGraphile-specific configuration
 * @returns PostGraphile data provider instance
 */
export function dataProvider(
  client: GraphQLClient,
  config: PostGraphileDataProviderConfig = { endpoint: "" }
): PostGraphileDataProvider {
  const {
    namingConvention = "simplified",
    filterOptions,
    schemaIntrospection = false,
  } = config;

  // Validate configuration
  if (!config.endpoint) {
    throw new Error("PostGraphile endpoint is required");
  }

  // Security validation for endpoint URL
  if (typeof config.endpoint !== "string" || config.endpoint.length === 0) {
    throw new Error("PostGraphile endpoint must be a non-empty string");
  }

  // Basic URL validation to prevent malicious endpoints
  try {
    const url = new URL(config.endpoint);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("PostGraphile endpoint must use HTTP or HTTPS protocol");
    }
  } catch (error) {
    throw new Error("PostGraphile endpoint must be a valid URL");
  }

  // Validate timeout is reasonable (not too high to prevent DoS)
  if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
    throw new Error("Timeout must be between 1000ms and 300000ms (5 minutes)");
  }

  return {
    // PostGraphile-specific properties
    namingConvention,
    supportsConnectionFiltering: true,
    supportsSimplifyInflection: namingConvention === "simplified",

    // CRUD methods
    getList: async <TData extends BaseRecord = BaseRecord>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      return getList(client, params, config);
    },

    getMany: async <TData extends BaseRecord = BaseRecord>(
      params: GetManyParams
    ): Promise<GetManyResponse<TData>> => {
      return getMany(client, params, config);
    },

    getOne: async <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      return getOne(client, params, config);
    },

    create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
      return create(client, params, config);
    },

    createMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateManyParams<TVariables>
    ): Promise<CreateManyResponse<TData>> => {
      return createMany(client, params, config);
    },

    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      return update(client, params, config);
    },

    updateMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateManyParams<TVariables>
    ): Promise<UpdateManyResponse<TData>> => {
      return updateMany(client, params, config);
    },

    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      return deleteOne(client, params, config);
    },

    deleteMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteManyParams<TVariables>
    ): Promise<DeleteManyResponse<TData>> => {
      return deleteMany(client, params, config);
    },

    getApiUrl: () => config.endpoint,

    custom: async <
      TData extends BaseRecord = BaseRecord,
      TQuery = unknown,
      TPayload = unknown
    >(
      params: CustomParams<TQuery, TPayload>
    ): Promise<CustomResponse<TData>> => {
      return custom(client, params, config);
    },
  };
}

/**
 * Get list of records with pagination, sorting, and filtering
 */
async function getList<TData extends BaseRecord = BaseRecord>(
  client: GraphQLClient,
  params: GetListParams,
  config: PostGraphileDataProviderConfig
): Promise<GetListResponse<TData>> {
  const { resource, pagination, sorters, filters, meta } = params;

  // Performance analysis and optimization hints
  const performanceHints = analyzeQueryPerformance(
    filters || [],
    pagination,
    sorters,
    (meta as any)?.fields
  );

  // Log performance warnings in development
  if (process.env.NODE_ENV === 'development' && performanceHints.complexity > 40) {
    console.warn(`[PostGraphile Data Provider] High complexity query detected for resource '${resource}':`, {
      complexity: performanceHints.complexity,
      suggestions: performanceHints.suggestions,
      cacheable: performanceHints.cacheable,
    });
  }

  // Extract operation name from meta or use plural resource name
  const operationName = getListOperationName(resource, meta as any);

  // Build GraphQL query for Relay connection
  const query = buildGetListQuery(operationName, meta);

  // Build variables for the query
  const variables = buildGetListVariables(
    pagination,
    sorters,
    filters as any,
    config
  );

  try {
    // Add performance hints to the query if cacheable (but not for custom queries or in test environments)
    let finalQuery = query;
    if (performanceHints.cacheable && config?.endpoint && !meta?.gqlQuery && process.env.NODE_ENV !== 'test') {
      // Add cache control hints for cacheable queries (only for generated queries)
      finalQuery = query.replace(
        'query ',
        `query @cacheControl(maxAge: 300) ` // 5 minute cache for cacheable queries
      );
    }

    const response = await client.request(finalQuery, variables);
    const result = parseGetListResponse<TData>(response, operationName);

    // Add performance metadata to result if requested
    if ((meta as any)?.includePerformanceHints) {
      (result as any)._performance = performanceHints;
    }

    return result;
  } catch (error) {
    throw handleGraphQLError(error);
  }
}

/**
 * Get multiple records by IDs
 */
async function getMany<TData extends BaseRecord = BaseRecord>(
  client: GraphQLClient,
  params: GetManyParams,
  config: PostGraphileDataProviderConfig
): Promise<GetManyResponse<TData>> {
  const { resource, ids, meta } = params;

  // For multiple IDs, we can use getList with an IN filter
  const listParams: GetListParams = {
    resource,
    pagination: { currentPage: 1, pageSize: ids.length },
    filters: [{ field: "id", operator: "in", value: ids }],
    meta: meta as any,
  };

  const result = await getList(client, listParams, config);
  return { data: result.data as TData[] };
}

/**
 * Get a single record by ID
 */
async function getOne<TData extends BaseRecord = BaseRecord>(
  client: GraphQLClient,
  params: GetOneParams,
  config: PostGraphileDataProviderConfig
): Promise<GetOneResponse<TData>> {
  const { resource, id, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta as any);

  // Build GraphQL query for single record
  const query = buildGetOneQuery(operationName, meta);

  // Build variables
  const variables = { id };

  try {
    const response = await client.request(query, variables);
    return parseGetOneResponse<TData>(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Create a new record
 */
async function create<TData extends BaseRecord = BaseRecord, TVariables = {}>(
  client: GraphQLClient,
  params: CreateParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<CreateResponse<TData>> {
  const { resource, variables, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta as any);

  // Build GraphQL mutation
  const mutation = buildCreateMutation(operationName, variables as any, meta);

  // Build variables
  const mutationVariables = { input: { object: variables } };

  try {
    const response = await client.request(mutation, mutationVariables);
    return parseCreateResponse<TData>(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Create multiple records
 */
async function createMany<
  TData extends BaseRecord = BaseRecord,
  TVariables = {}
>(
  client: GraphQLClient,
  params: CreateManyParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<CreateManyResponse<TData>> {
  const { resource, variables, meta } = params;

  // Execute multiple create operations
  const results = await Promise.all(
    variables.map((vars) =>
      create(client, { resource, variables: vars, meta: meta as any }, config)
    )
  );

  return { data: results.map((result) => result.data) as TData[] };
}

/**
 * Update a single record
 */
async function update<TData extends BaseRecord = BaseRecord, TVariables = {}>(
  client: GraphQLClient,
  params: UpdateParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<UpdateResponse<TData>> {
  const { resource, id, variables, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta as any);

  // Build GraphQL mutation
  const mutation = buildUpdateMutation(operationName, variables as any, meta);

  // Build variables - exclude id from object since it's passed separately
  const { id: _, ...updateVariables } = variables as any;
  const mutationVariables = { input: { id, object: updateVariables } };

  try {
    const response = await client.request(mutation, mutationVariables);
    return parseUpdateResponse<TData>(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Update multiple records
 */
async function updateMany<
  TData extends BaseRecord = BaseRecord,
  TVariables = {}
>(
  client: GraphQLClient,
  params: UpdateManyParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<UpdateManyResponse<TData>> {
  const { resource, ids, variables, meta } = params;

  // If we have specific IDs, update them individually
  if (ids && ids.length > 0) {
    const results = await Promise.all(
      ids.map((id) =>
        update(client, { resource, id, variables, meta: meta as any }, config)
      )
    );
    return { data: results.map((result) => result.data) as TData[] };
  }

  // Note: filters parameter is not available in UpdateManyParams interface
  // Bulk operations with filters require custom schema extensions in PostGraphile
  throw new Error(
    "Bulk update operations with filters require custom PostGraphile schema extensions. " +
      "Use individual update operations or implement custom bulk update mutations in your PostGraphile schema."
  );

  // No IDs or filters provided
  return { data: [] };
}

/**
 * Delete a single record
 */
async function deleteOne<
  TData extends BaseRecord = BaseRecord,
  TVariables = {}
>(
  client: GraphQLClient,
  params: DeleteOneParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<DeleteOneResponse<TData>> {
  const { resource, id, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta as any);

  // Build GraphQL mutation
  const mutation = buildDeleteMutation(operationName, meta);

  // Build variables
  const variables = { input: { id } };

  try {
    const response = await client.request(mutation, variables);
    return parseDeleteResponse<TData>(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Delete multiple records
 */
async function deleteMany<
  TData extends BaseRecord = BaseRecord,
  TVariables = {}
>(
  client: GraphQLClient,
  params: DeleteManyParams<TVariables>,
  config: PostGraphileDataProviderConfig
): Promise<DeleteManyResponse<TData>> {
  const { resource, ids, meta } = params;

  // If we have specific IDs, delete them individually
  if (ids && ids.length > 0) {
    const results = await Promise.all(
      ids.map((id) =>
        deleteOne(client, { resource, id, meta: meta as any }, config)
      )
    );
    return { data: results.map((result) => result.data) as TData[] };
  }

  // Note: filters parameter is not available in DeleteManyParams interface
  // Bulk operations with filters require custom schema extensions in PostGraphile
  throw new Error(
    "Bulk delete operations with filters require custom PostGraphile schema extensions. " +
      "Use individual delete operations or implement custom bulk delete mutations in your PostGraphile schema."
  );

  // No IDs or filters provided
  return { data: [] };
}

/**
 * Execute custom GraphQL operations
 */
async function custom<
  TData extends BaseRecord = BaseRecord,
  TQuery = unknown,
  TPayload = unknown
>(
  client: GraphQLClient,
  params: CustomParams<TQuery, TPayload>,
  config: PostGraphileDataProviderConfig
): Promise<CustomResponse<TData>> {
  const { url, method, headers, meta } = params;

  if (!meta?.gqlQuery && !meta?.gqlMutation) {
    throw new Error(
      "Custom operation requires gqlQuery or gqlMutation in meta"
    );
  }

  const query = meta.gqlQuery || meta.gqlMutation;
  const variables = meta.variables || {};

  // Handle DocumentNode vs string
  let finalQuery: any = query;
  if (query && typeof query === 'object' && query.loc) {
    finalQuery = query.loc.source.body;
  }

  try {
    const response = await client.request(finalQuery, variables);
    return { data: response as TData };
  } catch (error) {
    throw handleGraphQLError(error);
  }
}

// Utility functions (to be implemented in utils/)
function getListOperationName(
  resource: string,
  meta?: GraphQLOperationMeta
): string {
  // For lists, use the resource name as-is (assuming it's already plural)
  // PostGraphile generates: allUsers, allPosts, etc.
  return meta?.operation || resource;
}

function getSingleOperationName(
  resource: string,
  meta?: GraphQLOperationMeta
): string {
  // For single operations, singularize the resource name
  const baseName = meta?.operation || singularize(resource);
  // PostGraphile generates: userById, postById, etc.
  return baseName;
}

/**
 * Simple singularization function
 * TODO: Replace with a proper inflector library
 */
function singularize(word: string): string {
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }
  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Simple pluralization function
 * TODO: Replace with a proper inflector library
 */
function pluralize(word: string): string {
  // For "users", it should return "users" (already plural)
  // For most common cases, if it ends with 's', it's already plural
  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word;
  }
  if (word.endsWith("y")) {
    return word.slice(0, -1) + "ies";
  }
  if (
    word.endsWith("ss") ||
    word.endsWith("sh") ||
    word.endsWith("ch") ||
    word.endsWith("x") ||
    word.endsWith("z")
  ) {
    return word + "es";
  }
  return word + "s";
}

function buildGetListQuery(operationName: string, meta?: any): string {
  // Use custom query from meta if provided
  if (meta?.gqlQuery) {
    // Handle DocumentNode - extract the query string
    if (typeof meta.gqlQuery === "object" && meta.gqlQuery.loc) {
      return meta.gqlQuery.loc.source.body;
    }
    // Handle string queries
    if (typeof meta.gqlQuery === "string") {
      return meta.gqlQuery;
    }
    return "";
  }

  // Build field selection - optimize for performance
  let fields: string;
  if (meta?.fields && meta.fields.length > 0) {
    // Use provided fields, but ensure id is always included for Refine compatibility
    const fieldSet = new Set(meta.fields);
    fieldSet.add('id');
    fields = Array.from(fieldSet).join("\n          ");
  } else {
    // Default minimal selection for performance
    fields = "id";
  }

  // Capitalize operation name for GraphQL types
  const capitalizedName =
    operationName.charAt(0).toUpperCase() + operationName.slice(1);

  // Build the selection set
  const selection = `
    all${capitalizedName}(
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      nodes {
        ${fields}
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  `;

  return buildGraphQLQuery(
    "query",
    `Get${capitalizedName}List`,
    [
      "$first: Int",
      "$after: String",
      `$filter: ${capitalizedName}Filter`,
      `$orderBy: [${capitalizedName}OrderBy!]`,
    ],
    selection.trim()
  );
}

function buildGetOneQuery(operationName: string, meta?: any): string {
  // Use custom query from meta if provided
  if (meta?.gqlQuery) {
    // Handle DocumentNode - extract the query string
    if (typeof meta.gqlQuery === "object" && meta.gqlQuery.loc) {
      return meta.gqlQuery.loc.source.body;
    }
    // Handle string queries
    if (typeof meta.gqlQuery === "string") {
      return meta.gqlQuery;
    }
    return "";
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join("\n        ") : "id";

  // Build the selection set
  const selection = `
    ${operationName}ById(id: $id) {
      ${fields}
    }
  `;

  return buildGraphQLQuery(
    "query",
    `Get${operationName}`,
    ["$id: ID!"],
    selection.trim()
  );
}

function buildCreateMutation(
  operationName: string,
  variables: BaseRecord,
  meta?: any
): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    // Handle DocumentNode - extract the query string
    if (typeof meta.gqlMutation === "object" && meta.gqlMutation.loc) {
      return meta.gqlMutation.loc.source.body;
    }
    // Handle string queries
    if (typeof meta.gqlMutation === "string") {
      return meta.gqlMutation;
    }
    return "";
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join("\n          ") : "id";

  // Build the selection set
  const selection = `
    create${operationName.toLowerCase()}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Create${operationName}`,
    [`$input: Create${operationName.toLowerCase()}Input!`],
    selection.trim()
  );
}

function buildUpdateMutation(
  operationName: string,
  variables: BaseRecord,
  meta?: any
): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    // Handle DocumentNode - extract the query string
    if (typeof meta.gqlMutation === "object" && meta.gqlMutation.loc) {
      return meta.gqlMutation.loc.source.body;
    }
    // Handle string queries
    if (typeof meta.gqlMutation === "string") {
      return meta.gqlMutation;
    }
    return "";
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join("\n          ") : "id";

  // Build the selection set
  const selection = `
    update${operationName.toLowerCase()}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Update${operationName}`,
    [`$input: Update${operationName.toLowerCase()}Input!`],
    selection.trim()
  );
}

function buildDeleteMutation(operationName: string, meta?: any): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    // Handle DocumentNode - extract the query string
    if (typeof meta.gqlMutation === "object" && meta.gqlMutation.loc) {
      return meta.gqlMutation.loc.source.body;
    }
    // Handle string queries
    if (typeof meta.gqlMutation === "string") {
      return meta.gqlMutation;
    }
    return "";
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join("\n          ") : "id";

  // Build the selection set
  const selection = `
    delete${operationName.toLowerCase()}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Delete${operationName}`,
    [`$input: Delete${operationName.toLowerCase()}Input!`],
    selection.trim()
  );
}

function buildUpdateManyMutation(
  operationName: string,
  variables: BaseRecord,
  filters: Array<{ field: string; operator: string; value: any }>,
  meta?: any
): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    return meta.gqlMutation;
  }

  // Build field selection - for bulk updates, we typically get back affected records
  const fields = meta?.fields ? meta.fields.join("\n          ") : "id";

  // Build the selection set for bulk update
  const selection = `
    update${operationName.toLowerCase()}s(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Update${operationName}s`,
    [`$input: Update${operationName.toLowerCase()}sInput!`],
    selection.trim()
  );
}

function buildDeleteManyMutation(
  operationName: string,
  filters: Array<{ field: string; operator: string; value: any }>,
  meta?: any
): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    return meta.gqlMutation;
  }

  // Build field selection - for bulk deletes, we typically get back deleted records
  const fields = meta?.fields ? meta.fields.join("\n          ") : "id";

  // Build the selection set for bulk delete
  const selection = `
    delete${operationName.toLowerCase()}s(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Delete${operationName}s`,
    [`$input: Delete${operationName.toLowerCase()}sInput!`],
    selection.trim()
  );
}

function buildGetListVariables(
  pagination?: Pagination,
  sorters?: CrudSort[],
  filters?: CrudFilter[],
  config?: PostGraphileDataProviderConfig
): Record<string, any> {
  const variables: Record<string, any> = {};

  // Handle pagination with Relay cursor navigation
  if (pagination) {
    const { currentPage = 1, pageSize = 10 } = pagination;

    // For cursor-based pagination, we use first/last with after/before
    variables.first = pageSize;

    // For page > 1, we need to calculate the cursor
    // Since we don't have previous cursors, we'll use a simple offset-based cursor encoding
    if (currentPage > 1) {
      // Encode offset as base64 cursor (simplified approach)
      const offset = (currentPage - 1) * pageSize;
      variables.after = Buffer.from(`offset:${offset}`).toString('base64');
    }
  }

  // Handle sorting
  if (sorters && sorters.length > 0) {
    variables.orderBy = generateSorting(sorters);
  }

  // Handle filtering
  if (filters && filters.length > 0) {
    variables.filter = generateFilters(filters, config?.filterOptions);
  }

  return variables;
}

function parseGetListResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): GetListResponse<TData> {
  // Field name is all{ResourceName} (e.g., allUsers)
  const fieldName = `all${
    operationName.charAt(0).toUpperCase() + operationName.slice(1)
  }`;
  const connection = response[fieldName];

  if (!connection) {
    throw new Error(`Expected '${fieldName}' field in response`);
  }

  return {
    data: (connection.nodes || []) as TData[],
    total: connection.totalCount || 0,
  };
}

function parseGetOneResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): GetOneResponse<TData> {
  // Field name is {resourceName}ById (e.g., userById)
  const fieldName = `${operationName}ById`;
  const data = response[fieldName];

  if (!data) {
    throw new Error(`Expected '${fieldName}' field in response`);
  }

  return { data: data as TData };
}

function parseCreateResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): CreateResponse<TData> {
  // Field name follows simplified naming convention (lowercase)
  const fieldName = `create${operationName.toLowerCase()}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data as TData };
}

function parseUpdateResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): UpdateResponse<TData> {
  // Field name follows simplified naming convention (lowercase)
  const fieldName = `update${operationName.toLowerCase()}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data as TData };
}

function parseDeleteResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): DeleteOneResponse<TData> {
  // Field name follows simplified naming convention (lowercase)
  const fieldName = `delete${operationName.toLowerCase()}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data as TData };
}

function parseUpdateManyResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): UpdateManyResponse<TData> {
  // Field name follows simplified naming convention (lowercase plural)
  const fieldName = `update${operationName.toLowerCase()}s`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: (Array.isArray(result.data) ? result.data : [result.data]) as TData[] };
}

function parseDeleteManyResponse<TData extends BaseRecord = BaseRecord>(
  response: any,
  operationName: string
): DeleteManyResponse<TData> {
  // Field name follows simplified naming convention (lowercase plural)
  const fieldName = `delete${operationName.toLowerCase()}s`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: (Array.isArray(result.data) ? result.data : [result.data]) as TData[] };
}

function handleError(error: any): Error {
  // Placeholder - will be implemented with proper error handling
  if (error.response?.errors?.[0]) {
    return new Error(error.response.errors[0].message);
  }
  return error;
}
