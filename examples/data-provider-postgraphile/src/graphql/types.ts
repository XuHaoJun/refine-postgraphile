import type * as Types from "./schema.types";

export type GetCategoriesQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  after?: Types.InputMaybe<Types.Scalars["Cursor"]["input"]>;
  filter?: Types.InputMaybe<Types.CategoryFilter>;
  orderBy?: Types.InputMaybe<
    Array<Types.CategoryOrderBy> | Types.CategoryOrderBy
  >;
}>;

export type GetCategoriesQuery = {
  categories?: Types.Maybe<
    Pick<Types.CategoryConnection, "totalCount"> & {
      edges: Array<
        Types.Maybe<{
          node?: Types.Maybe<
            Pick<Types.Category, "id" | "title" | "createdAt">
          >;
        }>
      >;
      pageInfo: Pick<
        Types.PageInfo,
        "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor"
      >;
    }
  >;
};

export type CreateCategoryMutationVariables = Types.Exact<{
  input: Types.CreateCategoryInput;
}>;

export type CreateCategoryMutation = {
  createCategory?: Types.Maybe<{
    category?: Types.Maybe<Pick<Types.Category, "id" | "title" | "createdAt">>;
  }>;
};

export type UpdateCategoryMutationVariables = Types.Exact<{
  input: Types.UpdateCategoryByIdInput;
}>;

export type UpdateCategoryMutation = {
  updateCategoryById?: Types.Maybe<{
    category?: Types.Maybe<Pick<Types.Category, "id" | "title" | "createdAt">>;
  }>;
};

export type GetPostsQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  after?: Types.InputMaybe<Types.Scalars["Cursor"]["input"]>;
  filter?: Types.InputMaybe<Types.PostFilter>;
  orderBy?: Types.InputMaybe<Array<Types.PostOrderBy> | Types.PostOrderBy>;
}>;

export type GetPostsQuery = {
  posts?: Types.Maybe<
    Pick<Types.PostConnection, "totalCount"> & {
      edges: Array<
        Types.Maybe<{
          node?: Types.Maybe<
            Pick<
              Types.Post,
              "id" | "title" | "content" | "categoryId" | "createdAt"
            > & { category?: Types.Maybe<Pick<Types.Category, "id" | "title">> }
          >;
        }>
      >;
      pageInfo: Pick<
        Types.PageInfo,
        "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor"
      >;
    }
  >;
};

export type GetPostQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetPostQuery = {
  postById?: Types.Maybe<
    Pick<Types.Post, "id" | "title" | "content" | "categoryId"> & {
      category?: Types.Maybe<Pick<Types.Category, "id" | "title">>;
    }
  >;
};

export type CreatePostMutationVariables = Types.Exact<{
  input: Types.CreatePostInput;
}>;

export type CreatePostMutation = {
  createPost?: Types.Maybe<{
    post?: Types.Maybe<
      Pick<
        Types.Post,
        "id" | "title" | "content" | "categoryId" | "createdAt"
      > & { category?: Types.Maybe<Pick<Types.Category, "id" | "title">> }
    >;
  }>;
};

export type UpdatePostMutationVariables = Types.Exact<{
  input: Types.UpdatePostByIdInput;
}>;

export type UpdatePostMutation = {
  updatePostById?: Types.Maybe<{
    post?: Types.Maybe<
      Pick<
        Types.Post,
        "id" | "title" | "content" | "categoryId" | "createdAt"
      > & { category?: Types.Maybe<Pick<Types.Category, "id" | "title">> }
    >;
  }>;
};

export type DeletePostMutationVariables = Types.Exact<{
  input: Types.DeletePostByIdInput;
}>;

export type DeletePostMutation = {
  deletePostById?: Types.Maybe<{
    post?: Types.Maybe<
      Pick<Types.Post, "id" | "content"> & {
        category?: Types.Maybe<Pick<Types.Category, "id">>;
      }
    >;
  }>;
};

export type GetPostCategoriesSelectQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.CategoryFilter>;
}>;

export type GetPostCategoriesSelectQuery = {
  categories?: Types.Maybe<
    Pick<Types.CategoryConnection, "totalCount"> & {
      edges: Array<
        Types.Maybe<{
          node?: Types.Maybe<Pick<Types.Category, "id" | "rowId" | "title">>;
        }>
      >;
    }
  >;
};
