# Data Model: PostGraphile-Refine Integration

## Core Entities

### DatabaseTable Entity
Represents a PostgreSQL table exposed through PostGraphile's auto-generated GraphQL schema.

**Fields**:
- `name`: string - Table name (e.g., "users", "posts")
- `primaryKey`: string[] - Array of primary key column names
- `columns`: ColumnDefinition[] - Column definitions with types and constraints
- `relationships`: Relationship[] - Foreign key relationships to other tables
- `permissions`: PermissionSet - Row-level security permissions by role

**Validation Rules**:
- Name must be valid PostgreSQL identifier
- Primary key must be non-empty for update/delete operations
- Column types must be supported by PostGraphile
- Relationships must reference existing tables

### GraphQLSchema Entity
The auto-generated GraphQL schema from PostGraphile defining available operations.

**Fields**:
- `queryType`: QueryDefinition - Available query operations
- `mutationType`: MutationDefinition - Available mutation operations
- `types`: GraphQLType[] - All defined GraphQL types
- `directives`: GraphQLDirective[] - Available schema directives

**Validation Rules**:
- Must conform to GraphQL specification
- Must include Relay connection types for collections
- Must support filtering via postgraphile-plugin-connection-filter

### RefineResource Entity
Configuration entity mapping a database table to Refine UI components.

**Fields**:
- `name`: string - Resource identifier used in Refine
- `tableName`: string - Corresponding PostgreSQL table name
- `primaryKey`: string - Primary key field name for the resource
- `fields`: ResourceField[] - Field definitions for forms and tables
- `relationships`: ResourceRelationship[] - Related resources for navigation
- `permissions`: ResourcePermissions - CRUD permissions for the resource

**Validation Rules**:
- Name must be unique across all resources
- Table name must exist in database schema
- Primary key must match database table primary key
- Field types must be compatible with Refine components

### DataProviderConfiguration Entity
Integration layer configuration connecting Refine to PostGraphile API.

**Fields**:
- `endpoint`: string - PostGraphile GraphQL API endpoint URL
- `headers`: Record<string, string> - HTTP headers (including auth tokens)
- `namingConvention`: NamingConvention - Field naming strategy ("simplified" | "default")
- `filterOptions`: FilterOptions - Connection filter plugin settings
- `schemaIntrospection`: boolean - Enable schema introspection for dynamic fields

**Validation Rules**:
- Endpoint must be valid HTTP/HTTPS URL
- Headers must include valid authentication tokens if required
- Naming convention must match PostGraphile server configuration

## Entity Relationships

```
DataProviderConfiguration 1:N RefineResource
RefineResource 1:1 DatabaseTable
DatabaseTable N:N DatabaseTable (via foreign keys)
RefineResource N:N RefineResource (via relationships)
GraphQLSchema 1:1 DataProviderConfiguration
```

## State Transitions

### Resource Loading States
1. **Uninitialized** → **Loading** (when data provider connects)
2. **Loading** → **Ready** (when schema introspection completes)
3. **Ready** → **Error** (when API becomes unavailable)
4. **Error** → **Loading** (when reconnection attempted)

### CRUD Operation States
1. **Idle** → **Pending** (when operation initiated)
2. **Pending** → **Success** (when operation completes successfully)
3. **Pending** → **Error** (when operation fails)
4. **Success** → **Idle** (after success notification)
5. **Error** → **Idle** (after error handling)

## Data Flow

### Query Operations
```
Refine Component → DataProvider → GraphQL Query → PostGraphile → PostgreSQL → Results → DataProvider → Refine Component
```

### Mutation Operations
```
Refine Component → DataProvider → GraphQL Mutation → PostGraphile → PostgreSQL → Result → DataProvider → Refine Component
```

### Real-time Updates (Future)
```
PostgreSQL Changes → PostGraphile Subscriptions → GraphQL Subscription → LiveProvider → Refine Component
```

## Advanced Type Support

### PostgreSQL Arrays
- Stored as GraphQL List types
- Filtered using `includes`, `containedBy`, `overlaps` operators
- Form inputs support multiple value selection

### JSONB Fields
- Stored as GraphQL JSON scalars
- Filtered using `contains`, `containedBy`, `hasKey` operators
- Form inputs support structured JSON editing

### Enum Types
- Stored as GraphQL enum types
- Filtered using standard equality operators
- Form inputs render as select dropdowns

### Custom Types (Domains)
- Mapped to appropriate GraphQL scalars
- Filtering depends on underlying base type
- Form validation respects domain constraints

## Error Handling

### GraphQL Errors
- **ValidationError**: Invalid query/mutation syntax
- **ExecutionError**: Database constraint violations, permission errors
- **NetworkError**: API connectivity issues

### Database Errors
- **UniqueConstraintError**: Duplicate key violations
- **ForeignKeyConstraintError**: Referential integrity violations
- **CheckConstraintError**: Domain/business rule violations
- **PermissionError**: Row-level security violations

### Mapping Strategy
- GraphQL errors mapped to Refine error format
- Database errors translated to user-friendly messages
- Network errors trigger retry logic with exponential backoff
