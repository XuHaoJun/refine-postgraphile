# Research Findings: PostGraphile-Refine Integration

## PostGraphile v5 Architecture & GraphQL Schema

### Decision: Support PostGraphile v5 with Grafast execution engine
**Rationale**: PostGraphile v5 represents the current stable version with significant improvements over v4, including the new Grafast execution engine for better performance and the updated plugin architecture. The v5 API is stable and recommended for new implementations.

**Alternatives Considered**:
- PostGraphile v4: Older version with different plugin architecture, less performant
- Direct PostgreSQL drivers: Would require reimplementing GraphQL layer, losing PostGraphile's auto-generated schema benefits

### Key PostGraphile v5 Characteristics
- **Relay Connections**: Uses `allTableName` queries returning `TableNameConnection` with `nodes`, `edges`, `pageInfo`, `totalCount`
- **Cursor-based Pagination**: Relay specification with `first`/`last`, `after`/`before` cursors
- **Mutation Pattern**: Input/payload pattern with `createTable(input: {object: {...}})` mutations
- **Naming Conventions**: Configurable via @graphile/simplify-inflection (removes redundant suffixes like `ById`)

## @graphile/simplify-inflection Plugin

### Decision: Require @graphile/simplify-inflection for cleaner API surface
**Rationale**: Simplifies field names (`catById` → `cat`, `personByAuthorId` → `person`) making the API more intuitive and consistent with modern GraphQL conventions. This aligns better with Refine patterns and reduces cognitive load for developers.

**Naming Transformations**:
- Relation fields: `tableByFkColumn` → `table`
- Connection queries: `allTableConnection` → `allTable`
- Input types: `TableInput` (unchanged)
- Payload types: `CreateTablePayload` (unchanged)

**Alternatives Considered**:
- Default PostGraphile naming: More verbose but unambiguous
- Custom inflection plugin: Would require additional development and maintenance

## postgraphile-plugin-connection-filter Integration

### Decision: Leverage postgraphile-plugin-connection-filter for advanced filtering
**Rationale**: Provides powerful filtering capabilities matching Refine's expectations, supports PostgreSQL advanced types (arrays, JSONB, ranges, enums), and integrates seamlessly with PostGraphile's Relay connections.

### Filter Syntax Mapping
PostGraphile filter syntax: `{ fieldName: { operator: value } }`
```
filter: {
  or: [
    { fieldName: { equalTo: "value" } },
    { otherField: { greaterThan: 5 } }
  ]
}
```

**Supported Operators**: `equalTo`, `notEqualTo`, `greaterThan`, `lessThan`, `greaterThanOrEqualTo`, `lessThanOrEqualTo`, `in`, `notIn`, `isNull`, `includes`, `includedIn`, `startsWith`, `endsWith`, `contains`, etc.

**Performance Considerations**: Plugin allows configuration to restrict expensive operators for production safety.

## Refine Hasura Integration Analysis

### Key Differences from PostGraphile

| Aspect | Hasura | PostGraphile |
|--------|--------|--------------|
| Query Structure | Direct list queries: `table(where: {...}, order_by: {...})` | Relay connections: `allTable(first: 10, after: "cursor", filter: {...})` |
| Pagination | Offset-based + cursor | Relay cursor-based only |
| Filtering | Direct `where` parameter with `_and`, `_or`, `_eq` syntax | Nested `filter` parameter with `and`, `or`, `equalTo` syntax |
| Mutations | Direct: `insert_table(objects: [...])` | Input/payload pattern: `createTable(input: {object: {...}})` |
| Naming | Configurable (snake_case default) | @graphile/simplify-inflection recommended |

### Decision: Adapt Hasura patterns while respecting PostGraphile conventions
**Rationale**: Reuse proven Refine integration patterns (data provider structure, utility functions) but adapt for PostGraphile's specific GraphQL schema patterns. This minimizes development effort while ensuring compatibility.

## Authentication & Authorization

### Decision: Support PostGraphile's built-in JWT authentication
**Rationale**: PostGraphile has mature JWT token handling with role-based permissions built-in. This aligns with the feature requirements and avoids reimplementing auth logic.

**Implementation**: Pass JWT tokens via GraphQL client headers, let PostGraphile handle role-based field/method permissions.

## Data Provider Architecture

### Decision: Follow Refine Hasura data provider structure
**Rationale**: Proven pattern with comprehensive CRUD operations, proper TypeScript typing, and extensive testing. Adapt query generation logic for PostGraphile specifics.

### Required Adaptations
1. **Query Generation**: Convert Refine filters/sorting to PostGraphile connection syntax
2. **Pagination**: Implement Relay cursor pagination instead of Hasura's offset pagination
3. **Mutations**: Handle PostGraphile's input/payload mutation pattern
4. **Filtering**: Map Refine operators to postgraphile-plugin-connection-filter syntax

## Performance Considerations

### Decision: Optimize for PostGraphile's query planning capabilities
**Rationale**: PostGraphile's Grafast engine provides advanced query optimization. Focus on generating efficient GraphQL queries that leverage PostGraphile's capabilities rather than trying to optimize at the Refine level.

### Key Optimizations
- Use Relay connections for automatic pagination efficiency
- Generate targeted field selections to minimize over-fetching
- Leverage connection filtering for database-level filtering
- Support batch operations where possible

## Testing Strategy

### Decision: Comprehensive testing including PostGraphile API integration
**Rationale**: PostGraphile integration requires testing against real GraphQL schemas. Follow TDD with unit tests for utilities and integration tests for end-to-end functionality.

### Test Coverage
- Unit tests: Filter generation, sorting logic, GraphQL query builders
- Integration tests: Full CRUD operations against PostGraphile API
- Contract tests: Ensure Refine core compatibility
- Schema tests: Validate against different PostgreSQL schema patterns

## Migration Path

### Decision: Design for seamless migration from Hasura
**Rationale**: Many Refine users may migrate from Hasura to PostGraphile for PostgreSQL-specific features. Provide clear migration guides and API compatibility where possible.

### Compatibility Layer
- Similar configuration API where feasible
- Clear documentation of differences
- Migration examples and tooling
