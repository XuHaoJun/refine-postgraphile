export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Cursor: { input: any; output: any };
  Datetime: { input: any; output: any };
  UUID: { input: any; output: any };
};

export type Category = Node & {
  createdAt?: Maybe<Scalars["Datetime"]["output"]>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  id: Scalars["ID"]["output"];
  /** Reads and enables pagination through a set of `Post`. */
  posts: PostConnection;
  rowId: Scalars["UUID"]["output"];
  title: Scalars["String"]["output"];
};

export type CategoryPostsArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  condition?: InputMaybe<PostCondition>;
  filter?: InputMaybe<PostFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<PostOrderBy>>;
};

/**
 * A condition to be used against `Category` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export type CategoryCondition = {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Checks for equality with the object’s `rowId` field. */
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** A connection to a list of `Category` values. */
export type CategoryConnection = {
  /** A list of edges which contains the `Category` and cursor to aid in pagination. */
  edges: Array<Maybe<CategoryEdge>>;
  /** A list of `Category` objects. */
  nodes: Array<Maybe<Category>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Category` you could get from the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** A `Category` edge in the connection. */
export type CategoryEdge = {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars["Cursor"]["output"]>;
  /** The `Category` at the end of the edge. */
  node?: Maybe<Category>;
};

/** A filter to be used against `Category` object types. All fields are combined with a logical ‘and.’ */
export type CategoryFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<CategoryFilter>>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Negates the expression. */
  not?: InputMaybe<CategoryFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<CategoryFilter>>;
  /** Filter by the object’s `posts` relation. */
  posts?: InputMaybe<CategoryToManyPostFilter>;
  /** Some related `posts` exist. */
  postsExist?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter by the object’s `rowId` field. */
  rowId?: InputMaybe<UuidFilter>;
};

/** An input for mutations affecting `Category` */
export type CategoryInput = {
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
  title: Scalars["String"]["input"];
};

/** Methods to use when ordering `Category`. */
export type CategoryOrderBy =
  | "CREATED_AT_ASC"
  | "CREATED_AT_DESC"
  | "NATURAL"
  | "PRIMARY_KEY_ASC"
  | "PRIMARY_KEY_DESC"
  | "ROW_ID_ASC"
  | "ROW_ID_DESC";

/** Represents an update to a `Category`. Fields that are set will be updated. */
export type CategoryPatch = {
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/** A filter to be used against many `Post` object types. All fields are combined with a logical ‘and.’ */
export type CategoryToManyPostFilter = {
  /** Every related `Post` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  every?: InputMaybe<PostFilter>;
  /** No related `Post` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  none?: InputMaybe<PostFilter>;
  /** Some related `Post` matches the filter criteria. All fields are combined with a logical ‘and.’ */
  some?: InputMaybe<PostFilter>;
};

/** All input for the create `Category` mutation. */
export type CreateCategoryInput = {
  /** The `Category` to be created by this mutation. */
  category: CategoryInput;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
};

/** The output of our create `Category` mutation. */
export type CreateCategoryPayload = {
  /** The `Category` that was created by this mutation. */
  category?: Maybe<Category>;
  /** An edge for our `Category`. May be used by Relay 1. */
  categoryEdge?: Maybe<CategoryEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our create `Category` mutation. */
export type CreateCategoryPayloadCategoryEdgeArgs = {
  orderBy?: Array<CategoryOrderBy>;
};

/** All input for the create `Post` mutation. */
export type CreatePostInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The `Post` to be created by this mutation. */
  post: PostInput;
};

/** The output of our create `Post` mutation. */
export type CreatePostPayload = {
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  /** The `Post` that was created by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our create `Post` mutation. */
export type CreatePostPayloadPostEdgeArgs = {
  orderBy?: Array<PostOrderBy>;
};

/** A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’ */
export type DatetimeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars["Datetime"]["input"]>>;
};

/** All input for the `deleteCategoryById` mutation. */
export type DeleteCategoryByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The globally unique `ID` which will identify a single `Category` to be deleted. */
  id: Scalars["ID"]["input"];
};

/** All input for the `deleteCategory` mutation. */
export type DeleteCategoryInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  rowId: Scalars["UUID"]["input"];
};

/** The output of our delete `Category` mutation. */
export type DeleteCategoryPayload = {
  /** The `Category` that was deleted by this mutation. */
  category?: Maybe<Category>;
  /** An edge for our `Category`. May be used by Relay 1. */
  categoryEdge?: Maybe<CategoryEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  deletedCategoryId?: Maybe<Scalars["ID"]["output"]>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our delete `Category` mutation. */
export type DeleteCategoryPayloadCategoryEdgeArgs = {
  orderBy?: Array<CategoryOrderBy>;
};

/** All input for the `deletePostById` mutation. */
export type DeletePostByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The globally unique `ID` which will identify a single `Post` to be deleted. */
  id: Scalars["ID"]["input"];
};

/** All input for the `deletePost` mutation. */
export type DeletePostInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  rowId: Scalars["UUID"]["input"];
};

/** The output of our delete `Post` mutation. */
export type DeletePostPayload = {
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  deletedPostId?: Maybe<Scalars["ID"]["output"]>;
  /** The `Post` that was deleted by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our delete `Post` mutation. */
export type DeletePostPayloadPostEdgeArgs = {
  orderBy?: Array<PostOrderBy>;
};

/** The root mutation type which contains root level fields which mutate data. */
export type Mutation = {
  /** Creates a single `Category`. */
  createCategory?: Maybe<CreateCategoryPayload>;
  /** Creates a single `Post`. */
  createPost?: Maybe<CreatePostPayload>;
  /** Deletes a single `Category` using a unique key. */
  deleteCategory?: Maybe<DeleteCategoryPayload>;
  /** Deletes a single `Category` using its globally unique id. */
  deleteCategoryById?: Maybe<DeleteCategoryPayload>;
  /** Deletes a single `Post` using a unique key. */
  deletePost?: Maybe<DeletePostPayload>;
  /** Deletes a single `Post` using its globally unique id. */
  deletePostById?: Maybe<DeletePostPayload>;
  /** Updates a single `Category` using a unique key and a patch. */
  updateCategory?: Maybe<UpdateCategoryPayload>;
  /** Updates a single `Category` using its globally unique id and a patch. */
  updateCategoryById?: Maybe<UpdateCategoryPayload>;
  /** Updates a single `Post` using a unique key and a patch. */
  updatePost?: Maybe<UpdatePostPayload>;
  /** Updates a single `Post` using its globally unique id and a patch. */
  updatePostById?: Maybe<UpdatePostPayload>;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteCategoryArgs = {
  input: DeleteCategoryInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeleteCategoryByIdArgs = {
  input: DeleteCategoryByIdInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeletePostArgs = {
  input: DeletePostInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationDeletePostByIdArgs = {
  input: DeletePostByIdInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdateCategoryByIdArgs = {
  input: UpdateCategoryByIdInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
};

/** The root mutation type which contains root level fields which mutate data. */
export type MutationUpdatePostByIdArgs = {
  input: UpdatePostByIdInput;
};

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  id: Scalars["ID"]["output"];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars["Cursor"]["output"]>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars["Cursor"]["output"]>;
};

export type Post = Node & {
  /** Reads a single `Category` that is related to this `Post`. */
  category?: Maybe<Category>;
  categoryId?: Maybe<Scalars["UUID"]["output"]>;
  content: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["Datetime"]["output"]>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  id: Scalars["ID"]["output"];
  rowId: Scalars["UUID"]["output"];
  title: Scalars["String"]["output"];
};

/** A condition to be used against `Post` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export type PostCondition = {
  /** Checks for equality with the object’s `categoryId` field. */
  categoryId?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  /** Checks for equality with the object’s `rowId` field. */
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
};

/** A connection to a list of `Post` values. */
export type PostConnection = {
  /** A list of edges which contains the `Post` and cursor to aid in pagination. */
  edges: Array<Maybe<PostEdge>>;
  /** A list of `Post` objects. */
  nodes: Array<Maybe<Post>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Post` you could get from the connection. */
  totalCount: Scalars["Int"]["output"];
};

/** A `Post` edge in the connection. */
export type PostEdge = {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars["Cursor"]["output"]>;
  /** The `Post` at the end of the edge. */
  node?: Maybe<Post>;
};

/** A filter to be used against `Post` object types. All fields are combined with a logical ‘and.’ */
export type PostFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<PostFilter>>;
  /** Filter by the object’s `category` relation. */
  category?: InputMaybe<CategoryFilter>;
  /** A related `category` exists. */
  categoryExists?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter by the object’s `categoryId` field. */
  categoryId?: InputMaybe<UuidFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<DatetimeFilter>;
  /** Negates the expression. */
  not?: InputMaybe<PostFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<PostFilter>>;
  /** Filter by the object’s `rowId` field. */
  rowId?: InputMaybe<UuidFilter>;
};

/** An input for mutations affecting `Post` */
export type PostInput = {
  categoryId?: InputMaybe<Scalars["UUID"]["input"]>;
  content: Scalars["String"]["input"];
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
  title: Scalars["String"]["input"];
};

/** Methods to use when ordering `Post`. */
export type PostOrderBy =
  | "CATEGORY_ID_ASC"
  | "CATEGORY_ID_DESC"
  | "CREATED_AT_ASC"
  | "CREATED_AT_DESC"
  | "NATURAL"
  | "PRIMARY_KEY_ASC"
  | "PRIMARY_KEY_DESC"
  | "ROW_ID_ASC"
  | "ROW_ID_DESC";

/** Represents an update to a `Post`. Fields that are set will be updated. */
export type PostPatch = {
  categoryId?: InputMaybe<Scalars["UUID"]["input"]>;
  content?: InputMaybe<Scalars["String"]["input"]>;
  createdAt?: InputMaybe<Scalars["Datetime"]["input"]>;
  rowId?: InputMaybe<Scalars["UUID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  /** Reads and enables pagination through a set of `Category`. */
  categories?: Maybe<CategoryConnection>;
  /** Get a single `Category`. */
  category?: Maybe<Category>;
  /** Reads a single `Category` using its globally unique `ID`. */
  categoryById?: Maybe<Category>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  id: Scalars["ID"]["output"];
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** Get a single `Post`. */
  post?: Maybe<Post>;
  /** Reads a single `Post` using its globally unique `ID`. */
  postById?: Maybe<Post>;
  /** Reads and enables pagination through a set of `Post`. */
  posts?: Maybe<PostConnection>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
};

/** The root query type which gives access points into the data universe. */
export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  condition?: InputMaybe<CategoryCondition>;
  filter?: InputMaybe<CategoryFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<CategoryOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryCategoryArgs = {
  rowId: Scalars["UUID"]["input"];
};

/** The root query type which gives access points into the data universe. */
export type QueryCategoryByIdArgs = {
  id: Scalars["ID"]["input"];
};

/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  id: Scalars["ID"]["input"];
};

/** The root query type which gives access points into the data universe. */
export type QueryPostArgs = {
  rowId: Scalars["UUID"]["input"];
};

/** The root query type which gives access points into the data universe. */
export type QueryPostByIdArgs = {
  id: Scalars["ID"]["input"];
};

/** The root query type which gives access points into the data universe. */
export type QueryPostsArgs = {
  after?: InputMaybe<Scalars["Cursor"]["input"]>;
  before?: InputMaybe<Scalars["Cursor"]["input"]>;
  condition?: InputMaybe<PostCondition>;
  filter?: InputMaybe<PostFilter>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  orderBy?: InputMaybe<Array<PostOrderBy>>;
};

/** A filter to be used against UUID fields. All fields are combined with a logical ‘and.’ */
export type UuidFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars["UUID"]["input"]>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars["UUID"]["input"]>>;
};

/** All input for the `updateCategoryById` mutation. */
export type UpdateCategoryByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The globally unique `ID` which will identify a single `Category` to be updated. */
  id: Scalars["ID"]["input"];
  /** An object where the defined keys will be set on the `Category` being updated. */
  patch: CategoryPatch;
};

/** All input for the `updateCategory` mutation. */
export type UpdateCategoryInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** An object where the defined keys will be set on the `Category` being updated. */
  patch: CategoryPatch;
  rowId: Scalars["UUID"]["input"];
};

/** The output of our update `Category` mutation. */
export type UpdateCategoryPayload = {
  /** The `Category` that was updated by this mutation. */
  category?: Maybe<Category>;
  /** An edge for our `Category`. May be used by Relay 1. */
  categoryEdge?: Maybe<CategoryEdge>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our update `Category` mutation. */
export type UpdateCategoryPayloadCategoryEdgeArgs = {
  orderBy?: Array<CategoryOrderBy>;
};

/** All input for the `updatePostById` mutation. */
export type UpdatePostByIdInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** The globally unique `ID` which will identify a single `Post` to be updated. */
  id: Scalars["ID"]["input"];
  /** An object where the defined keys will be set on the `Post` being updated. */
  patch: PostPatch;
};

/** All input for the `updatePost` mutation. */
export type UpdatePostInput = {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars["String"]["input"]>;
  /** An object where the defined keys will be set on the `Post` being updated. */
  patch: PostPatch;
  rowId: Scalars["UUID"]["input"];
};

/** The output of our update `Post` mutation. */
export type UpdatePostPayload = {
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars["String"]["output"]>;
  /** The `Post` that was updated by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
};

/** The output of our update `Post` mutation. */
export type UpdatePostPayloadPostEdgeArgs = {
  orderBy?: Array<PostOrderBy>;
};
