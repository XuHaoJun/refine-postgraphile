# Refine PostGraphile Example

This example demonstrates how to use Refine with PostGraphile as the backend GraphQL API, featuring advanced filtering capabilities through the `postgraphile-plugin-connection-filter`.

## Features

- 🚀 **Full CRUD Operations**: Create, Read, Update, Delete operations
- 🔍 **Advanced Filtering**: PostGraphile connection filter plugin support
- 📊 **Pagination**: Relay-style cursor-based pagination
- 🎯 **Type Safety**: Full TypeScript support
- 🛡️ **Security**: Built-in GraphQL security features

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 18 (provided via Docker)

## Quick Start

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL with initial data
docker-compose up -d
```

This will start PostgreSQL 18 with the sample database schema and data.

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd postgraphile-backend
npm install
cd ..
```

### 3. Start the PostGraphile Backend

```bash
# From the postgraphile-backend directory
cd postgraphile-backend
npm run dev
```

The PostGraphile server will be available at:
- GraphQL API: http://localhost:5000/graphql
- GraphiQL Interface: http://localhost:5000

### 4. Start the Frontend

```bash
# From the root directory
npm run dev
```

The Refine application will be available at: http://localhost:5173

## Project Structure

```
.
├── postgraphile-backend/     # PostGraphile server
│   ├── index.ts             # Server entry point
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript config
├── src/                     # Refine frontend
│   ├── pages/               # CRUD pages
│   ├── App.tsx              # Main app component
│   └── ...
├── docker-compose.yaml      # PostgreSQL service
├── init.sql                # Database schema and sample data
└── package.json            # Frontend dependencies
```

## Database Schema

The example uses two main tables:

- **categories**: Blog categories with UUID primary keys
- **posts**: Blog posts with foreign key relationship to categories

### Sample Data

The database is initialized with:
- 5 categories (Technology, Science, Business, Health, Education)
- 12 sample blog posts across different categories

## PostGraphile Configuration

The backend uses:

- **PostGraphile v5** with V4 preset compatibility
- **Connection Filter Plugin** (v3.0.0-rc.1) for advanced filtering
- **Relay Connections** for pagination
- **GraphiQL** interface for API exploration
- **WebSocket support** for real-time subscriptions

### Key Features Enabled

- Connection filtering with operators like `contains`, `startsWith`, `greaterThan`, etc.
- Relay-style pagination with cursors
- Computed columns filtering
- Logical operators (`and`, `or`, `not`)
- Array and JSON field filtering

## GraphQL API

### Available Queries

```graphql
# List posts with filtering and pagination
query GetPosts($first: Int!, $filter: PostsFilter) {
  postsConnection(first: $first, filter: $filter) {
    edges {
      node {
        id
        title
        content
        categoryId
        createdAt
        category {
          id
          title
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}

# Get single post
query GetPost($id: UUID!) {
  post(id: $id) {
    id
    title
    content
    category {
      id
      title
    }
  }
}
```

### Available Mutations

```graphql
# Create post
mutation CreatePost($input: CreatePostsInput!) {
  createPosts(input: $input) {
    posts {
      id
      title
      content
    }
  }
}

# Update post
mutation UpdatePost($input: UpdatePostsInput!) {
  updatePosts(input: $input) {
    posts {
      id
      title
      content
    }
  }
}

# Delete post
mutation DeletePost($input: DeletePostsInput!) {
  deletePosts(input: $input) {
    posts {
      id
      title
    }
  }
}
```

## Filtering Examples

### Text Filtering

```javascript
// Filter posts by title containing "AI"
filters: [
  { field: "title", operator: "contains", value: "AI" }
]

// Filter posts by title starting with "The"
filters: [
  { field: "title", operator: "startsWith", value: "The" }
]
```

### Date Filtering

```javascript
// Filter posts created after a date
filters: [
  { field: "createdAt", operator: "gt", value: "2023-01-01" }
]
```

### Relationship Filtering

```javascript
// Filter posts by category title
filters: [
  { field: "category.title", operator: "eq", value: "Technology" }
]
```

### Logical Operators

```javascript
// Complex filter with AND/OR logic
filters: [
  {
    operator: "and",
    value: [
      { field: "title", operator: "contains", value: "AI" },
      { field: "createdAt", operator: "gt", value: "2023-01-01" }
    ]
  }
]
```

## Development

### Regenerating GraphQL Types

```bash
npm run codegen
```

This will update the TypeScript types based on your GraphQL schema.

### Database Management

```bash
# Stop database
docker-compose down

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

### Environment Variables

You can customize the database connection by setting:

```bash
# In postgraphile-backend directory
DATABASE_URL="postgres://user:password@localhost:5432/custom_db"
```

## Troubleshooting

### Common Issues

1. **Port 5432 already in use**: Change the port in `docker-compose.yaml`
2. **Port 5000 already in use**: Update the port in `postgraphile-backend/index.ts`
3. **GraphQL errors**: Check the GraphiQL interface at http://localhost:5000

### Database Connection Issues

Ensure PostgreSQL is running:
```bash
docker-compose ps
docker-compose logs postgres
```

### GraphQL Schema Issues

If the schema doesn't match expectations, check:
1. PostGraphile is running: http://localhost:5000
2. Database has the correct schema: Check `init.sql`
3. Regenerate types: `npm run codegen`

## Learn More

- [Refine Documentation](https://refine.dev/docs)
- [PostGraphile Documentation](https://www.graphile.org/postgraphile/)
- [PostGraphile Connection Filter Plugin](https://github.com/graphile-contrib/postgraphile-plugin-connection-filter)
