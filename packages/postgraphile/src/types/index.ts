import type { BaseRecord } from "@refinedev/core";

/**
 * Represents a PostgreSQL table exposed through PostGraphile's auto-generated GraphQL schema
 */
export interface DatabaseTable {
  /** Table name (e.g., "users", "posts") */
  name: string;

  /** Array of primary key column names */
  primaryKey: string[];

  /** Column definitions with types and constraints */
  columns: ColumnDefinition[];

  /** Foreign key relationships to other tables */
  relationships: Relationship[];

  /** Row-level security permissions by role */
  permissions: PermissionSet;
}

/**
 * Column definition for a database table
 */
export interface ColumnDefinition {
  /** Column name */
  name: string;

  /** PostgreSQL data type */
  type: string;

  /** Whether the column is nullable */
  nullable: boolean;

  /** Whether the column has a default value */
  hasDefault: boolean;

  /** Whether the column is part of the primary key */
  isPrimaryKey: boolean;

  /** Whether the column is a foreign key */
  isForeignKey: boolean;

  /** Foreign key reference (if applicable) */
  references?: {
    table: string;
    column: string;
  };

  /** Column description/comment */
  description?: string;
}

/**
 * Foreign key relationship between tables
 */
export interface Relationship {
  /** Relationship name */
  name: string;

  /** Type of relationship */
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

  /** Source table and column */
  source: {
    table: string;
    column: string;
  };

  /** Target table and column */
  target: {
    table: string;
    column: string;
  };

  /** Whether this is a reverse relationship (for navigation) */
  isReverse?: boolean;
}

/**
 * Permission set for row-level security
 */
export interface PermissionSet {
  /** Permissions by database role */
  [role: string]: {
    /** Whether the role can select/read records */
    select: boolean;

    /** Whether the role can insert/create records */
    insert: boolean;

    /** Whether the role can update records */
    update: boolean;

    /** Whether the role can delete records */
    delete: boolean;

    /** Column-level permissions for select */
    selectColumns?: string[];

    /** Column-level permissions for insert */
    insertColumns?: string[];

    /** Column-level permissions for update */
    updateColumns?: string[];
  };
}

/**
 * The auto-generated GraphQL schema from PostGraphile
 */
export interface GraphQLSchema {
  /** Available query operations */
  queryType: QueryDefinition;

  /** Available mutation operations */
  mutationType: MutationDefinition;

  /** All defined GraphQL types */
  types: GraphQLType[];

  /** Available schema directives */
  directives: GraphQLDirective[];
}

/**
 * Query operations available in the GraphQL schema
 */
export interface QueryDefinition {
  /** Connection queries (Relay-style) */
  connections: Record<string, ConnectionField>;

  /** Direct queries */
  queries: Record<string, FieldDefinition>;
}

/**
 * Mutation operations available in the GraphQL schema
 */
export interface MutationDefinition {
  /** Create mutations */
  creates: Record<string, MutationField>;

  /** Update mutations */
  updates: Record<string, MutationField>;

  /** Delete mutations */
  deletes: Record<string, MutationField>;
}

/**
 * GraphQL type definition
 */
export interface GraphQLType {
  /** Type name */
  name: string;

  /** Type kind (OBJECT, INPUT_OBJECT, ENUM, etc.) */
  kind: string;

  /** Type description */
  description?: string;

  /** Fields for object types */
  fields?: FieldDefinition[];

  /** Input fields for input object types */
  inputFields?: InputFieldDefinition[];

  /** Enum values for enum types */
  enumValues?: EnumValue[];

  /** Interfaces implemented by this type */
  interfaces?: string[];
}

/**
 * GraphQL field definition
 */
export interface FieldDefinition {
  /** Field name */
  name: string;

  /** Field description */
  description?: string;

  /** Field type */
  type: GraphQLTypeRef;

  /** Field arguments */
  args?: ArgumentDefinition[];

  /** Whether the field is deprecated */
  isDeprecated?: boolean;

  /** Deprecation reason */
  deprecationReason?: string;
}

/**
 * GraphQL input field definition
 */
export interface InputFieldDefinition {
  /** Field name */
  name: string;

  /** Field description */
  description?: string;

  /** Field type */
  type: GraphQLTypeRef;

  /** Default value */
  defaultValue?: any;
}

/**
 * GraphQL argument definition
 */
export interface ArgumentDefinition {
  /** Argument name */
  name: string;

  /** Argument description */
  description?: string;

  /** Argument type */
  type: GraphQLTypeRef;

  /** Default value */
  defaultValue?: any;
}

/**
 * GraphQL type reference
 */
export interface GraphQLTypeRef {
  /** Type name */
  name: string;

  /** Whether the type is non-null */
  nonNull: boolean;

  /** Whether the type is a list */
  list: boolean;

  /** For list types, whether the list itself is non-null */
  listNonNull?: boolean;
}

/**
 * GraphQL enum value
 */
export interface EnumValue {
  /** Enum value name */
  name: string;

  /** Enum value description */
  description?: string;

  /** Whether the enum value is deprecated */
  isDeprecated?: boolean;

  /** Deprecation reason */
  deprecationReason?: string;
}

/**
 * GraphQL directive definition
 */
export interface GraphQLDirective {
  /** Directive name */
  name: string;

  /** Directive description */
  description?: string;

  /** Directive locations */
  locations: string[];

  /** Directive arguments */
  args?: ArgumentDefinition[];
}

/**
 * Connection field for Relay-style pagination
 */
export interface ConnectionField extends FieldDefinition {
  /** The node type being connected */
  nodeType: string;

  /** Whether filtering is supported */
  supportsFiltering: boolean;

  /** Whether sorting is supported */
  supportsSorting: boolean;
}

/**
 * Mutation field definition
 */
export interface MutationField extends FieldDefinition {
  /** The table being mutated */
  tableName: string;

  /** Mutation operation type */
  operation: "create" | "update" | "delete";
}

/**
 * Configuration entity mapping a database table to Refine UI components
 */
export interface RefineResource {
  /** Resource identifier used in Refine */
  name: string;

  /** Corresponding PostgreSQL table name */
  tableName: string;

  /** Primary key field name for the resource */
  primaryKey: string;

  /** Field definitions for forms and tables */
  fields: ResourceField[];

  /** Related resources for navigation */
  relationships: ResourceRelationship[];

  /** CRUD permissions for the resource */
  permissions: ResourcePermissions;
}

/**
 * Field definition for a Refine resource
 */
export interface ResourceField {
  /** Field name */
  name: string;

  /** Field label for UI */
  label?: string;

  /** Field type */
  type: "string" | "number" | "boolean" | "date" | "array" | "object" | "enum";

  /** Whether the field is required */
  required?: boolean;

  /** Whether the field is read-only */
  readOnly?: boolean;

  /** Default value */
  defaultValue?: any;

  /** Validation rules */
  validation?: FieldValidation[];

  /** UI component hints */
  component?: {
    type: string;
    props?: BaseRecord;
  };
}

/**
 * Validation rule for a resource field
 */
export interface FieldValidation {
  /** Validation type */
  type: "required" | "min" | "max" | "pattern" | "custom";

  /** Validation value */
  value?: any;

  /** Validation message */
  message?: string;
}

/**
 * Relationship definition for a Refine resource
 */
export interface ResourceRelationship {
  /** Relationship name */
  name: string;

  /** Target resource name */
  target: string;

  /** Relationship type */
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

  /** Foreign key field name */
  foreignKey?: string;

  /** Whether to show this relationship in the UI */
  visible?: boolean;
}

/**
 * CRUD permissions for a Refine resource
 */
export interface ResourcePermissions {
  /** Whether the resource can be listed */
  list?: boolean;

  /** Whether the resource can be created */
  create?: boolean;

  /** Whether the resource can be edited */
  edit?: boolean;

  /** Whether the resource can be shown */
  show?: boolean;

  /** Whether the resource can be deleted */
  delete?: boolean;

  /** Field-level permissions */
  fields?: Record<string, {
    list?: boolean;
    create?: boolean;
    edit?: boolean;
    show?: boolean;
  }>;
}

/**
 * Integration layer configuration connecting Refine to PostGraphile API
 */
export interface DataProviderConfiguration {
  /** PostGraphile GraphQL API endpoint URL */
  endpoint: string;

  /** HTTP headers (including auth tokens) */
  headers?: Record<string, string>;

  /** Field naming strategy */
  namingConvention: "simplified" | "default";

  /** Connection filter plugin settings */
  filterOptions?: {
    /** Allow null literals in filter inputs */
    allowNullInput?: boolean;

    /** Allow empty objects in filter inputs */
    allowEmptyObjectInput?: boolean;

    /** Restrict allowed filter operators */
    allowedOperators?: string[];

    /** Restrict filtering to specific field types */
    allowedFieldTypes?: string[];
  };

  /** Enable schema introspection for dynamic fields */
  schemaIntrospection?: boolean;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Retry configuration */
  retry?: {
    /** Maximum number of retries */
    attempts?: number;

    /** Delay between retries in milliseconds */
    delay?: number;
  };
}
