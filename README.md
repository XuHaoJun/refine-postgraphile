# @xuhaojun/refine-postgraphile

[![npm version](https://img.shields.io/npm/v/@xuhaojun/refine-postgraphile.svg)](https://www.npmjs.com/package/@xuhaojun/refine-postgraphile)
[![npm downloads](https://img.shields.io/npm/dm/@xuhaojun/refine-postgraphile.svg)](https://www.npmjs.com/package/@xuhaojun/refine-postgraphile)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Refine](https://refine.dev/) data provider for [PostGraphile](https://www.graphile.org/postgraphile/) that enables seamless integration with PostGraphile-generated GraphQL APIs.

## Features

- 🚀 **Full CRUD Operations**: Create, Read, Update, Delete, and List operations
- 🔍 **Advanced Filtering**: Support for PostGraphile's `postgraphile-plugin-connection-filter`
- 📊 **Pagination**: Relay-style cursor-based pagination
- 🔄 **Real-time Subscriptions**: Live data updates via GraphQL subscriptions
- 🎯 **Type Safety**: Full TypeScript support with generated type definitions
- 🛡️ **Security**: Built-in protection against GraphQL injection attacks
- ⚡ **Performance**: Optimized queries with connection filtering and sorting

## Installation

```bash
npm install @xuhaojun/refine-postgraphile @refinedev/core graphql-request gql-query-builder
```

Or with yarn:

```bash
yarn add @xuhaojun/refine-postgraphile @refinedev/core graphql-request gql-query-builder
```

## PostGraphile Setup

Ensure your PostGraphile server is configured with the required plugins:

```typescript
// postgraphile.config.mjs
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

export default {
  extends: [
    PostGraphileConnectionFilterPreset,
    // other presets...
  ],
  plugins: [
    "postgraphile-plugin-connection-filter",
    "@graphile/simplify-inflection",
    // other plugins...
  ],
  // ... other config
};
```

## Quick Start

```typescript
import { Refine } from "@refinedev/core";
import { dataProvider, liveProvider } from "@xuhaojun/refine-postgraphile";
import { GraphQLClient } from "graphql-request";

const API_URL = "https://your-postgraphile-api.com/graphql";

const client = new GraphQLClient(API_URL, {
  headers: {
    // Add authentication headers if needed
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
});

function App() {
  return (
    <Refine
      dataProvider={dataProvider(client)}
      liveProvider={liveProvider(client, { wsUrl: "wss://your-api.com/graphql" })}
      resources={[
        {
          name: "users",
          list: "/users",
          create: "/users/create",
          edit: "/users/edit/:id",
          show: "/users/show/:id",
          meta: {
            operation: "users", // GraphQL operation name
          },
        },
      ]}
      // ... other Refine props
    >
      {/* Your app content */}
    </Refine>
  );
}

export default App;
```

## API Reference

### dataProvider

Creates a PostGraphile data provider for Refine.

```typescript
function dataProvider(
  client: GraphQLClient,
  config?: PostGraphileDataProviderConfig
): PostGraphileDataProvider
```

#### Parameters

- `client`: GraphQL client instance from `graphql-request`
- `config`: Optional configuration object

#### PostGraphileDataProviderConfig

```typescript
interface PostGraphileDataProviderConfig {
  endpoint: string;                    // GraphQL API endpoint URL
  headers?: Record<string, string>;    // HTTP headers
  namingConvention?: "simplified" | "default"; // Field naming convention
  filterOptions?: FilterOptions;       // Connection filter options
  schemaIntrospection?: boolean;       // Enable schema introspection
  timeout?: number;                    // Request timeout in milliseconds
  retry?: {
    attempts?: number;                 // Maximum retry attempts
    delay?: number;                    // Delay between retries
  };
}
```

### liveProvider

Creates a live provider for real-time subscriptions.

```typescript
function liveProvider(
  client: GraphQLClient,
  config?: PostGraphileLiveProviderConfig
): LiveProvider
```

#### Parameters

- `client`: GraphQL client instance
- `config`: Optional live provider configuration

#### PostGraphileLiveProviderConfig

```typescript
interface PostGraphileLiveProviderConfig {
  wsUrl?: string;                     // WebSocket URL for subscriptions
  headers?: Record<string, string>;   // WebSocket connection headers
  connectionTimeout?: number;         // Connection timeout
  reconnection?: {
    enabled?: boolean;               // Enable auto-reconnection
    initialDelay?: number;           // Initial reconnection delay
    maxDelay?: number;              // Maximum reconnection delay
    backoffMultiplier?: number;     // Delay multiplier
  };
  debug?: boolean;                   // Enable debug logging
}
```

## Supported Operations

### CRUD Operations

- `getList` - Fetch a list of records with filtering, sorting, and pagination
- `getOne` - Fetch a single record by ID
- `create` - Create a new record
- `createMany` - Create multiple records
- `update` - Update a record by ID
- `updateMany` - Update multiple records
- `deleteOne` - Delete a record by ID
- `deleteMany` - Delete multiple records

### Filtering

The provider supports all PostGraphile connection filter operators:

```typescript
const { data } = useList({
  resource: "users",
  filters: [
    { field: "name", operator: "contains", value: "John" },
    { field: "active", operator: "eq", value: true },
    { field: "createdAt", operator: "gte", value: "2023-01-01" },
  ],
});
```

### Sorting

```typescript
const { data } = useList({
  resource: "users",
  sorters: [
    { field: "createdAt", order: "desc" },
    { field: "name", order: "asc" },
  ],
});
```

### Pagination

Uses Relay-style cursor-based pagination:

```typescript
const { data, hasNextPage, hasPreviousPage } = useList({
  resource: "users",
  pagination: { current: 1, pageSize: 10 },
});
```

## Real-time Subscriptions

Enable real-time data updates with GraphQL subscriptions:

```typescript
// In your resource configuration
<Refine
  liveProvider={liveProvider(client, {
    wsUrl: "wss://your-api.com/graphql"
  })}
  liveMode="auto" // Automatically refresh data on changes
  // ... other props
>
```

## Type Definitions

The package exports comprehensive TypeScript types:

```typescript
import type {
  PostGraphileDataProvider,
  PostGraphileDataProviderConfig,
  PostGraphileLiveProviderConfig,
  Connection,
  Edge,
  PageInfo,
  FilterInput,
  SortingInput,
  PaginationInput,
} from "@xuhaojun/refine-postgraphile";
```

## Security

The provider includes multiple security measures:

- **Field Name Validation**: Prevents injection through malicious field names
- **Operator Validation**: Restricts allowed filter operators
- **Query Length Limits**: Prevents extremely large queries
- **GraphQL Identifier Validation**: Ensures valid operation names
- **URL Validation**: Validates endpoint URLs
- **Input Sanitization**: Cleans and validates all user inputs

## Error Handling

The provider includes comprehensive error handling with user-friendly messages:

```typescript
import { PostGraphileError, ErrorCodes } from "@xuhaojun/refine-postgraphile";

try {
  // Your data operations
} catch (error) {
  if (error instanceof PostGraphileError) {
    console.log("Error code:", error.code);
    console.log("User message:", getUserFriendlyErrorMessage(error));
  }
}
```

## Migration from Hasura

If you're migrating from `@refinedev/hasura`, the API is similar but with PostGraphile-specific differences:

```typescript
// Hasura (old)
import dataProvider from "@refinedev/hasura";

// PostGraphile (new)
import { dataProvider } from "@xuhaojun/refine-postgraphile";
```

Key differences:
- Uses Relay connections instead of direct list queries
- Different mutation patterns (input/payload vs direct field updates)
- Connection-based filtering syntax
- Simplified inflection naming conventions

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE.md) for details.

## Support

- 📖 [Documentation](https://refine.dev/docs)
- 🐛 [Bug Reports](https://github.com/refinedev/refine/issues)
- 💬 [Community Discussions](https://github.com/refinedev/refine/discussions)
- 💡 [Feature Requests](https://github.com/refinedev/refine/issues/new?template=feature_request.md)

## Examples

Check out our [example implementations](https://github.com/refinedev/refine/tree/master/examples) to see the provider in action.
