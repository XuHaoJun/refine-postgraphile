import {
  List,
  useTable,
  EditButton,
  DateField,
  getDefaultSortOrder,
} from "@refinedev/antd";

import { Table } from "antd";

import type { Category } from "graphql/schema.types";
import { CATEGORIES_QUERY } from "./queries";

export const CategoryList = () => {
  const { tableProps, sorters } = useTable<Category>({
    meta: {
      gqlQuery: CATEGORIES_QUERY,
    },

    sorters: {
      initial: [
        {
          field: "id",
          order: "asc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} format="LLL" />}
          defaultSortOrder={getDefaultSortOrder("created_at", sorters)}
          sorter
        />
        <Table.Column<Category>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <EditButton size="small" hideText recordItemId={record.id} />
          )}
        />
      </Table>
    </List>
  );
};
