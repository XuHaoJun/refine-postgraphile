# Quick Start: PostGraphile Integration with Refine

This guide will get you up and running with the PostGraphile data provider for Refine in under 15 minutes.

## Prerequisites

- Node.js 20+
- A running PostGraphile v5 server with:
  - `@graphile/simplify-inflection` plugin
  - `postgraphile-plugin-connection-filter` plugin
  - PostgreSQL database with sample data

## Step 1: Install Dependencies

```bash
npm install @xuhaojun/refine-postgraphile @refinedev/core graphql-request gql-query-builder
```

Or with yarn:
```bash
yarn add @xuhaojun/refine-postgraphile @refinedev/core graphql-request gql-query-builder
```

## Step 2: Configure PostGraphile Server

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

## Step 3: Set Up Data Provider

Create a new Refine app or add to an existing one:

```typescript
// src/App.tsx
import { Refine } from "@refinedev/core";
import dataProvider from "@xuhaojun/refine-postgraphile";
import { GraphQLClient } from "graphql-request";

const API_URL = "https://your-postgraphile-api.com/graphql";

const client = new GraphQLClient(API_URL, {
  headers: {
    // Add authentication headers if needed
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
});

const App = () => {
  return (
    <Refine
      dataProvider={dataProvider(client)}
      // ... other Refine props
    >
      {/* Your app content */}
    </Refine>
  );
};

export default App;
```

## Step 4: Define Resources

Configure your Refine resources to match your PostGraphile schema:

```typescript
// src/App.tsx
import { Refine } from "@refinedev/core";
import dataProvider from "@xuhaojun/refine-postgraphile";
import { GraphQLClient } from "graphql-request";

const API_URL = "https://your-postgraphile-api.com/graphql";

const client = new GraphQLClient(API_URL);

const App = () => {
  return (
    <Refine
      dataProvider={dataProvider(client, {
        namingConvention: "simplified", // Use simplified inflection
      })}
      resources={[
        {
          name: "users",
          list: "/users",
          create: "/users/create",
          edit: "/users/edit/:id",
          show: "/users/show/:id",
          meta: {
            // PostGraphile-specific configuration
            operation: "users", // GraphQL operation name
          },
        },
        {
          name: "posts",
          list: "/posts",
          create: "/posts/create",
          edit: "/posts/edit/:id",
          show: "/posts/show/:id",
          meta: {
            operation: "posts",
          },
        },
      ]}
      // ... other props
    >
      {/* Your app content */}
    </Refine>
  );
};
```

## Step 5: Create CRUD Pages

Generate basic CRUD pages for your resources:

```typescript
// src/pages/users/list.tsx
import { List, Table, useTable } from "@refinedev/antd";
import { ColumnsType } from "antd/es/table";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export const UserList = () => {
  const { tableProps } = useTable<User>();

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <List>
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
};
```

```typescript
// src/pages/users/create.tsx
import { Create, Form, Input, useForm } from "@refinedev/antd";

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

## Step 6: Add Filtering and Sorting

Leverage PostGraphile's advanced filtering capabilities:

```typescript
// src/pages/posts/list.tsx
import { List, Table, useTable, FilterDropdown, Select } from "@refinedev/antd";
import { ColumnsType } from "antd/es/table";
import { Input } from "antd";

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
}

export const PostList = () => {
  const { tableProps, searchFormProps } = useTable<Post>({
    filters: {
      initial: [
        {
          field: "title",
          operator: "contains",
          value: "",
        },
      ],
    },
  });

  const columns: ColumnsType<Post> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filterDropdown: (props) => (
        <FilterDropdown {...props}>
          <Input placeholder="Search title" />
        </FilterDropdown>
      ),
    },
    {
      title: "Author",
      dataIndex: ["author", "name"],
      key: "author",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
  ];

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="title">
          <Input placeholder="Search posts..." />
        </Form.Item>
      </Form>
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
};
```

## Step 7: Test Your Integration

Start your development server:

```bash
npm run dev
# or
yarn dev
```

Visit your app and test:
- ✅ List views display data from PostGraphile
- ✅ Create forms save new records
- ✅ Edit forms update existing records
- ✅ Delete operations remove records
- ✅ Filtering works with text search
- ✅ Sorting works on clickable column headers
- ✅ Pagination works with large datasets

## Troubleshooting

### Common Issues

**"GraphQL operation not found" errors:**
- Check that your PostGraphile server has the `@graphile/simplify-inflection` plugin enabled
- Verify the `namingConvention` option matches your server configuration

**Filtering not working:**
- Ensure `postgraphile-plugin-connection-filter` is installed and configured
- Check that filter operators are supported for your field types

**Authentication issues:**
- Verify JWT tokens are properly formatted and included in headers
- Check that your PostGraphile server accepts the authentication method

### Debug Mode

Enable debug logging to see GraphQL queries:

```typescript
const client = new GraphQLClient(API_URL, {
  headers: {
    Authorization: "Bearer YOUR_JWT_TOKEN",
  },
  // Enable request logging in development
  ...(process.env.NODE_ENV === "development" && {
    requestMiddleware: (request) => {
      console.log("GraphQL Request:", request);
      return request;
    },
  }),
});
```

## Next Steps

- [Configure authentication](auth-setup.md)
- [Set up real-time subscriptions](subscriptions.md)
- [Customize field types](custom-fields.md)
- [Optimize performance](performance-tuning.md)

## Example Repository

Check out our [example implementation](https://github.com/refinedev/refine/tree/master/examples/with-postgraphile) for a complete working setup.
