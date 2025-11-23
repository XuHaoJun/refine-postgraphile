import type { GraphQLClient } from "graphql-request";
import type {
  PostGraphileDataProvider,
  PostGraphileDataProviderConfig,
  GraphQLOperationMeta,
} from "../interfaces";
import type {
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  CreateParams,
  CreateResult,
  CreateManyParams,
  CreateManyResult,
  UpdateParams,
  UpdateResult,
  UpdateManyParams,
  UpdateManyResult,
  DeleteOneParams,
  DeleteOneResult,
  DeleteManyParams,
  DeleteManyResult,
  CustomParams,
  CustomResult,
  BaseRecord,
} from "@refinedev/core";
import { handleGraphQLError } from "../utils/errors";
import { generateFilters } from "../utils/generateFilters";
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

  return {
    // PostGraphile-specific properties
    namingConvention,
    supportsConnectionFiltering: true,
    supportsSimplifyInflection: namingConvention === "simplified",

    // CRUD methods
    getList: async (params: GetListParams): Promise<GetListResult> => {
      return getList(client, params, config);
    },

    getMany: async (params: GetManyParams): Promise<GetManyResult> => {
      return getMany(client, params, config);
    },

    getOne: async (params: GetOneParams): Promise<GetOneResult> => {
      return getOne(client, params, config);
    },

    create: async (params: CreateParams): Promise<CreateResult> => {
      return create(client, params, config);
    },

    createMany: async (params: CreateManyParams): Promise<CreateManyResult> => {
      return createMany(client, params, config);
    },

    update: async (params: UpdateParams): Promise<UpdateResult> => {
      return update(client, params, config);
    },

    updateMany: async (params: UpdateManyParams): Promise<UpdateManyResult> => {
      return updateMany(client, params, config);
    },

    deleteOne: async (params: DeleteOneParams): Promise<DeleteOneResult> => {
      return deleteOne(client, params, config);
    },

    deleteMany: async (params: DeleteManyParams): Promise<DeleteManyResult> => {
      return deleteMany(client, params, config);
    },

    custom: async (params: CustomParams): Promise<CustomResult> => {
      return custom(client, params, config);
    },
  };
}

/**
 * Get list of records with pagination, sorting, and filtering
 */
async function getList(
  client: GraphQLClient,
  params: GetListParams,
  config: PostGraphileDataProviderConfig
): Promise<GetListResult> {
  const { resource, pagination, sorters, filters, meta } = params;

  // Extract operation name from meta or use plural resource name
  const operationName = getListOperationName(resource, meta);

  // Build GraphQL query for Relay connection
  const query = buildGetListQuery(operationName, meta);

  // Build variables for the query
  const variables = buildGetListVariables(pagination, sorters, filters, config);

  try {
    const response = await client.request(query, variables);
    return parseGetListResponse(response, operationName);
  } catch (error) {
    throw handleGraphQLError(error);
  }
}

/**
 * Get multiple records by IDs
 */
async function getMany(
  client: GraphQLClient,
  params: GetManyParams,
  config: PostGraphileDataProviderConfig
): Promise<GetManyResult> {
  const { resource, ids, meta } = params;

  // For multiple IDs, we can use getList with an IN filter
  const listParams: GetListParams = {
    resource,
    pagination: { current: 1, pageSize: ids.length },
    filters: [{ field: "id", operator: "in", value: ids }],
    meta,
  };

  const result = await getList(client, listParams, config);
  return { data: result.data };
}

/**
 * Get a single record by ID
 */
async function getOne(
  client: GraphQLClient,
  params: GetOneParams,
  config: PostGraphileDataProviderConfig
): Promise<GetOneResult> {
  const { resource, id, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta);

  // Build GraphQL query for single record
  const query = buildGetOneQuery(operationName, meta);

  // Build variables
  const variables = { id };

  try {
    const response = await client.request(query, variables);
    return parseGetOneResponse(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Create a new record
 */
async function create(
  client: GraphQLClient,
  params: CreateParams,
  config: PostGraphileDataProviderConfig
): Promise<CreateResult> {
  const { resource, variables, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta);

  // Build GraphQL mutation
  const mutation = buildCreateMutation(operationName, variables, meta);

  // Build variables
  const mutationVariables = { input: { object: variables } };

  try {
    const response = await client.request(mutation, mutationVariables);
    return parseCreateResponse(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Create multiple records
 */
async function createMany(
  client: GraphQLClient,
  params: CreateManyParams,
  config: PostGraphileDataProviderConfig
): Promise<CreateManyResult> {
  const { resource, variables, meta } = params;

  // Execute multiple create operations
  const results = await Promise.all(
    variables.map((vars) =>
      create(client, { resource, variables: vars, meta }, config)
    )
  );

  return { data: results.map((result) => result.data) };
}

/**
 * Update a single record
 */
async function update(
  client: GraphQLClient,
  params: UpdateParams,
  config: PostGraphileDataProviderConfig
): Promise<UpdateResult> {
  const { resource, id, variables, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta);

  // Build GraphQL mutation
  const mutation = buildUpdateMutation(operationName, variables, meta);

  // Build variables
  const mutationVariables = { input: { id, object: variables } };

  try {
    const response = await client.request(mutation, mutationVariables);
    return parseUpdateResponse(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Update multiple records
 */
async function updateMany(
  client: GraphQLClient,
  params: UpdateManyParams,
  config: PostGraphileDataProviderConfig
): Promise<UpdateManyResult> {
  const { resource, ids, variables, meta } = params;

  // Execute multiple update operations
  const results = await Promise.all(
    ids.map((id) =>
      update(client, { resource, id, variables, meta }, config)
    )
  );

  return { data: results.map((result) => result.data) };
}

/**
 * Delete a single record
 */
async function deleteOne(
  client: GraphQLClient,
  params: DeleteOneParams,
  config: PostGraphileDataProviderConfig
): Promise<DeleteOneResult> {
  const { resource, id, meta } = params;

  // Extract operation name from meta or use singular resource name
  const operationName = getSingleOperationName(resource, meta);

  // Build GraphQL mutation
  const mutation = buildDeleteMutation(operationName, meta);

  // Build variables
  const variables = { input: { id } };

  try {
    const response = await client.request(mutation, variables);
    return parseDeleteResponse(response, operationName);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Delete multiple records
 */
async function deleteMany(
  client: GraphQLClient,
  params: DeleteManyParams,
  config: PostGraphileDataProviderConfig
): Promise<DeleteManyResult> {
  const { resource, ids, meta } = params;

  // Execute multiple delete operations
  const results = await Promise.all(
    ids.map((id) =>
      deleteOne(client, { resource, id, meta }, config)
    )
  );

  return { data: results.map((result) => result.data) };
}

/**
 * Execute custom GraphQL operations
 */
async function custom(
  client: GraphQLClient,
  params: CustomParams,
  config: PostGraphileDataProviderConfig
): Promise<CustomResult> {
  const { url, method, headers, meta } = params;

  if (!meta?.gqlQuery && !meta?.gqlMutation) {
    throw new Error("Custom operation requires gqlQuery or gqlMutation in meta");
  }

  const query = meta.gqlQuery || meta.gqlMutation;
  const variables = meta.variables || {};

  try {
    const response = await client.request(query, variables);
    return { data: response };
  } catch (error) {
    throw handleError(error);
  }
}

// Utility functions (to be implemented in utils/)
function getListOperationName(resource: string, meta?: GraphQLOperationMeta): string {
  // For lists, use the resource name as-is (assuming it's already plural)
  // PostGraphile generates: allUsers, allPosts, etc.
  return meta?.operation || resource;
}

function getSingleOperationName(resource: string, meta?: GraphQLOperationMeta): string {
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
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
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
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word;
  }
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('ss') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

function buildGetListQuery(operationName: string, meta?: GraphQLOperationMeta): string {
  // Use custom query from meta if provided
  if (meta?.gqlQuery) {
    return meta.gqlQuery;
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join('\n          ') : 'id';

  // Capitalize operation name for GraphQL types
  const capitalizedName = operationName.charAt(0).toUpperCase() + operationName.slice(1);

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

function buildGetOneQuery(operationName: string, meta?: GraphQLOperationMeta): string {
  // Use custom query from meta if provided
  if (meta?.gqlQuery) {
    return meta.gqlQuery;
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join('\n        ') : 'id';

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

function buildCreateMutation(operationName: string, variables: BaseRecord, meta?: GraphQLOperationMeta): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    return meta.gqlMutation;
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join('\n          ') : 'id';

  // Build the selection set
  const selection = `
    create${operationName}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Create${operationName}`,
    [`$input: Create${operationName}Input!`],
    selection.trim()
  );
}

function buildUpdateMutation(operationName: string, variables: BaseRecord, meta?: GraphQLOperationMeta): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    return meta.gqlMutation;
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join('\n          ') : 'id';

  // Build the selection set
  const selection = `
    update${operationName}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Update${operationName}`,
    [`$input: Update${operationName}Input!`],
    selection.trim()
  );
}

function buildDeleteMutation(operationName: string, meta?: GraphQLOperationMeta): string {
  // Use custom mutation from meta if provided
  if (meta?.gqlMutation) {
    return meta.gqlMutation;
  }

  // Build field selection
  const fields = meta?.fields ? meta.fields.join('\n          ') : 'id';

  // Build the selection set
  const selection = `
    delete${operationName}(input: $input) {
      data {
        ${fields}
      }
    }
  `;

  return buildGraphQLQuery(
    "mutation",
    `Delete${operationName}`,
    [`$input: Delete${operationName}Input!`],
    selection.trim()
  );
}

function buildGetListVariables(
  pagination?: { current?: number; pageSize?: number },
  sorters?: Array<{ field: string; order: string }>,
  filters?: Array<{ field: string; operator: string; value: any }>,
  config?: PostGraphileDataProviderConfig
): Record<string, any> {
  const variables: Record<string, any> = {};

  // Handle pagination
  if (pagination) {
    variables.first = pagination.pageSize || 10;
    // Note: For simplicity, we're using offset-based pagination initially
    // Full cursor-based pagination would require more complex cursor calculation
  }

  // Handle sorting
  if (sorters && sorters.length > 0) {
    variables.orderBy = generateSorting(sorters);
  }

  // Handle filtering
  if (filters && filters.length > 0) {
    variables.filter = generateFilters(filters);
  }

  return variables;
}

function parseGetListResponse(response: any, operationName: string): GetListResult {
  // Field name is all{ResourceName} (e.g., allUsers)
  const fieldName = `all${operationName.charAt(0).toUpperCase() + operationName.slice(1)}`;
  const connection = response[fieldName];

  if (!connection) {
    throw new Error(`Expected '${fieldName}' field in response`);
  }

  return {
    data: connection.nodes || [],
    total: connection.totalCount || 0,
  };
}

function parseGetOneResponse(response: any, operationName: string): GetOneResult {
  // Field name is {resourceName}ById (e.g., userById)
  const fieldName = `${operationName}ById`;
  const data = response[fieldName];

  if (!data) {
    throw new Error(`Expected '${fieldName}' field in response`);
  }

  return { data };
}

function parseCreateResponse(response: any, operationName: string): CreateResult {
  // Field name is create{ResourceName} (e.g., createUser)
  const fieldName = `create${operationName.charAt(0).toUpperCase() + operationName.slice(1)}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data };
}

function parseUpdateResponse(response: any, operationName: string): UpdateResult {
  // Field name is update{ResourceName} (e.g., updateUser)
  const fieldName = `update${operationName.charAt(0).toUpperCase() + operationName.slice(1)}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data };
}

function parseDeleteResponse(response: any, operationName: string): DeleteOneResult {
  // Field name is delete{ResourceName} (e.g., deleteUser)
  const fieldName = `delete${operationName.charAt(0).toUpperCase() + operationName.slice(1)}`;
  const result = response[fieldName];

  if (!result?.data) {
    throw new Error(`Expected '${fieldName}.data' field in response`);
  }

  return { data: result.data };
}

function handleError(error: any): Error {
  // Placeholder - will be implemented with proper error handling
  if (error.response?.errors?.[0]) {
    return new Error(error.response.errors[0].message);
  }
  return error;
}
