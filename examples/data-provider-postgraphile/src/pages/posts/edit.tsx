import React from "react";
import type { HttpError } from "@refinedev/core";

import {
  Edit,
  ListButton,
  RefreshButton,
  useForm,
  useSelect,
} from "@refinedev/antd";

import { Form, Input, Select } from "antd";

import MDEditor from "@uiw/react-md-editor";

import type {
  GetPostCategoriesSelectQuery,
  UpdatePostMutationVariables,
} from "graphql/types";
import type {
  GetVariables,
} from "@xuhaojun/refine-postgraphile";
import { POST_CATEGORIES_SELECT_QUERY, POST_UPDATE_MUTATION } from "./queries";
import { Category, Post } from "graphql/schema.types";

export const PostEdit = () => {
  const {
    formProps,
    saveButtonProps,
    query: queryResult,
    formLoading,
  } = useForm<
    Post,
    HttpError,
    GetVariables<UpdatePostMutationVariables>
  >({
    meta: {
      gqlMutation: POST_UPDATE_MUTATION,
    },
  });

  const postData = queryResult?.data?.data;
  const { selectProps: categorySelectProps } = useSelect<
    Category
  >({
    resource: "categories",
    defaultValue: postData?.categoryByCategoryId?.id,

    meta: {
      gqlQuery: POST_CATEGORIES_SELECT_QUERY,
    },

    pagination: {
      mode: "server",
    },
  });

  return (
    <Edit
      isLoading={formLoading}
      headerProps={{
        extra: (
          <>
            <ListButton />
            <RefreshButton onClick={() => queryResult?.refetch()} />
          </>
        ),
      }}
      saveButtonProps={saveButtonProps}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values) =>
          formProps.onFinish?.({
            ...values,
          })
        }
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category_id"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item
          label="Content"
          name="content"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <MDEditor data-color-mode="light" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
