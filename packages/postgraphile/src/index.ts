// Main data provider export
export { dataProvider } from "./dataProvider";

// Live provider export
export { liveProvider } from "./liveProvider";
export type { PostGraphileLiveProviderConfig } from "./liveProvider";

// Utility exports
export * from "./utils";

// Type exports
export type {
  PostGraphileDataProvider,
  PostGraphileDataProviderConfig,
  GraphQLOperationMeta,
  Connection,
  Edge,
  PageInfo,
  FilterInput,
  SortingInput,
  PaginationInput,
  CreateInput,
  UpdateInput,
  DeleteInput,
  MutationPayload,
  GraphQLError,
  GraphQLLocation,
  GraphQLResponse,
  GetFieldsFromList,
  GetFields,
  GetVariables,
} from "./interfaces";

export type {
  DatabaseTable,
  ColumnDefinition,
  Relationship,
  PermissionSet,
  GraphQLSchema,
  QueryDefinition,
  MutationDefinition,
  GraphQLType,
  FieldDefinition,
  InputFieldDefinition,
  ArgumentDefinition,
  GraphQLTypeRef,
  EnumValue,
  GraphQLDirective,
  ConnectionField,
  MutationField,
  RefineResource,
  ResourceField,
  FieldValidation,
  ResourceRelationship,
  ResourcePermissions,
  DataProviderConfiguration,
} from "./types";

// Error handling exports
export {
  PostGraphileError,
  ErrorCodes,
  handleGraphQLError,
  handleSingleGraphQLError,
  handleDatabaseError,
  isRetryableError,
  getUserFriendlyErrorMessage,
  createErrorLog,
  withErrorHandling,
} from "./utils/errors";

// GraphQL client utilities
export {
  createGraphQLClient,
  updateClientHeaders,
  setAuthToken,
  clearAuthToken,
  validateEndpoint,
  buildGraphQLQuery,
  buildGraphQLMutation,
  extractOperationName,
  sanitizeGraphQLQuery,
  buildGraphQLFragment,
  mergeSelections,
  buildVariableDefinition,
} from "./utils/graphql";
