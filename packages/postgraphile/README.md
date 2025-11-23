# @xuhaojun/refine-postgraphile

[![npm version](https://img.shields.io/npm/v/@xuhaojun/refine-postgraphile.svg)](https://www.npmjs.com/package/@xuhaojun/refine-postgraphile)
[![npm downloads](https://img.shields.io/npm/dm/@xuhaojun/refine-postgraphile.svg)](https://www.npmjs.com/package/@xuhaojun/refine-postgraphile)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Refine](https://refine.dev/) data provider for [PostGraphile V5](https://www.graphile.org/postgraphile/) that enables seamless integration with PostGraphile-generated GraphQL APIs.

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
npm install @xuhaojun/refine-postgraphile @refinedev/core @refinedev/antd graphql-request gql-query-builder
```

Or with yarn:

```bash
yarn add @xuhaojun/refine-postgraphile @refinedev/core @refinedev/antd graphql-request gql-query-builder
```

### Additional Dependencies for Full Setup

For a complete setup including UI components, routing, and development tools:

```bash
npm install @refinedev/react-router react-router antd @ant-design/v5-patch-for-react-19 react react-dom typescript @vitejs/plugin-react vite
```

Or with yarn:

```bash
yarn add @refinedev/react-router react-router antd @ant-design/v5-patch-for-react-19 react react-dom typescript @vitejs/plugin-react vite
```

## PostGraphile Setup

Ensure your PostGraphile server is configured with the required plugins:

```typescript
// graphile.config.ts
import { makePgService } from "postgraphile/@dataplan/pg/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

const preset: GraphileConfig.Preset = {
  extends: [PostGraphileAmberPreset, PgSimplifyInflectionPreset, PostGraphileConnectionFilterPreset],
  pgServices: [
    makePgService({
      connectionString: process.env.DATABASE_URL || "postgres://postgres:test@localhost:5433/postgraphile_example",
      schemas: ["public"],
      pubsub: true,
    }),
  ],
  grafast: {
    explain: true,
  },
  grafserv: {
    websockets: true,
  },
  schema: {
    pgJwtSecret: "example-secret-key-change-in-production",
    connectionFilterAllowEmptyObjectInput: true,
    connectionFilterAllowNullInput: true,
  },
};

export default preset;
```

### Required Dependencies

```json
{
  "dependencies": {
    "postgraphile": "^5.0.0-rc.1",
    "postgraphile-plugin-connection-filter": "3.0.0-rc.1",
    "@graphile/simplify-inflection": "^8.0.0-rc.1",
    "@graphile/pg-aggregates": "^0.2.0-rc.1"
  }
}
```

## Quick Start

### 1. Database Setup

Start PostgreSQL with Docker:

```bash
docker run -d \
  --name postgraphile-postgres \
  -e POSTGRES_DB=postgraphile_example \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test \
  -p 5433:5432 \
  postgres:18-alpine
```

### 2. Create Database Schema

Apply the schema and sample data:

```sql
-- Run this SQL in your PostgreSQL database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data...
```

### 3. PostGraphile Server

Create a PostGraphile server:

```typescript
// server.ts
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { grafserv } from "postgraphile/grafserv/express/v4";
import { pgl } from "postgraphile";

const serv = pgl.createServ(grafserv, {
  // Your PostGraphile config here
});

const app = express();
app.use(cors());
const server = createServer(app);

serv.addTo(app, server).catch((e) => {
  console.error(e);
  process.exit(1);
});

server.listen(5000, "0.0.0.0");
console.log("🚀 PostGraphile server running on http://localhost:5000");
```

### 4. Refine Application

```typescript
import { Refine } from "@refinedev/core";
import { dataProvider } from "@xuhaojun/refine-postgraphile";
import { GraphQLClient } from "graphql-request";

const API_URL = "http://localhost:5000/graphql";
const client = new GraphQLClient(API_URL);

const gqlDataProvider = dataProvider(client);

function App() {
  return (
    <Refine
      dataProvider={gqlDataProvider}
      resources={[
        {
          name: "posts",
          list: "/posts",
          create: "/posts/create",
          edit: "/posts/edit/:id",
          show: "/posts/show/:id",
        },
        {
          name: "categories",
          list: "/categories",
          create: "/categories/create",
          edit: "/categories/edit/:id",
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
): PostGraphileDataProvider;
```

#### Parameters

- `client`: GraphQL client instance from `graphql-request`
- `config`: Optional configuration object

#### PostGraphileDataProviderConfig

```typescript
interface PostGraphileDataProviderConfig {
  endpoint?: string; // GraphQL API endpoint URL (optional, can be set via client)
  headers?: Record<string, string>; // HTTP headers
  namingConvention?: "simplified" | "default"; // Field naming convention (default: "simplified")
  filterOptions?: FilterOptions; // Connection filter options
  schemaIntrospection?: boolean; // Enable schema introspection
  timeout?: number; // Request timeout in milliseconds
  retry?: {
    attempts?: number; // Maximum retry attempts
    delay?: number; // Delay between retries
  };
}
```

### liveProvider

Creates a live provider for real-time subscriptions.

```typescript
function liveProvider(
  client: GraphQLClient,
  config?: PostGraphileLiveProviderConfig
): LiveProvider;
```

#### Parameters

- `client`: GraphQL client instance
- `config`: Optional live provider configuration

#### PostGraphileLiveProviderConfig

```typescript
interface PostGraphileLiveProviderConfig {
  wsUrl?: string; // WebSocket URL for subscriptions
  headers?: Record<string, string>; // WebSocket connection headers
  connectionTimeout?: number; // Connection timeout
  reconnection?: {
    enabled?: boolean; // Enable auto-reconnection
    initialDelay?: number; // Initial reconnection delay
    maxDelay?: number; // Maximum reconnection delay
    backoffMultiplier?: number; // Delay multiplier
  };
  debug?: boolean; // Enable debug logging
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

The provider supports PostGraphile connection filter operators:

```typescript
const { data } = useList({
  resource: "posts",
  filters: [
    { field: "title", operator: "contains", value: "AI" },
    { field: "createdAt", operator: "gte", value: "2023-01-01" },
    { field: "category.title", operator: "eq", value: "Technology" },
  ],
});
```

#### Supported Filter Operators

- `eq` - Equal to
- `neq` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `in` - In array
- `notIn` - Not in array
- `contains` - Contains substring (case-sensitive)
- `notContains` - Does not contain substring
- `startsWith` - Starts with
- `notStartsWith` - Does not start with
- `endsWith` - Ends with
- `notEndsWith` - Does not end with
- `isNull` - Is null
- `isNotNull` - Is not null

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

## Working Example

A complete working example is available in the `examples/data-provider-postgraphile/` directory. This example demonstrates:

- Full CRUD operations for posts and categories
- Advanced filtering with PostGraphile connection filters
- Relay-style pagination
- TypeScript integration with GraphQL codegen
- Docker-based PostgreSQL setup

### Running the Example

```bash
# 1. Start PostgreSQL database
cd examples/data-provider-postgraphile
docker-compose up -d

# 2. Install dependencies
npm install
cd postgraphile-backend && npm install && cd ..

# 3. Start PostGraphile backend
cd postgraphile-backend
npm run dev

# 4. In another terminal, start the Refine frontend
cd ..
npm run dev
```

The example will be available at:
- Frontend: http://localhost:5173
- GraphQL API: http://localhost:5000/graphql
- GraphiQL Interface: http://localhost:5000

### Example Features

- **Blog Management**: CRUD operations for blog posts and categories
- **Advanced Filtering**: Search posts by title, category, date, etc.
- **Pagination**: Relay-style cursor-based pagination
- **Type Safety**: Full TypeScript support with generated types
- **Real-time Ready**: WebSocket support configured for subscriptions

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
