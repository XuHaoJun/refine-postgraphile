import gql from "graphql-tag";

export const POSTS_QUERY = gql`
    query GetPosts(
        $first: Int
        $after: Cursor
        $filter: PostFilter
        $orderBy: [PostsOrderBy!]
    ) {
        allPosts(
            first: $first
            after: $after
            filter: $filter
            orderBy: $orderBy
        ) {
            edges {
                node {
                    id
                    title
                    content
                    categoryId
                    createdAt
                    categoryByCategoryId {
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
`;

export const POST_QUERY = gql`
    query GetPost($id: UUID!) {
        postById(id: $id) {
            id
            title
            content
            categoryByCategoryId {
                id
                title
            }
        }
    }
`;

export const POST_CREATE_MUTATION = gql`
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            post {
                id
                title
                content
                categoryId
                createdAt
                categoryByCategoryId {
                    id
                    title
                }
            }
        }
    }
`;

export const POST_UPDATE_MUTATION = gql`
    mutation UpdatePost($input: UpdatePostByIdInput!) {
        updatePostById(input: $input) {
            post {
                id
                title
                content
                categoryId
                createdAt
                categoryByCategoryId {
                    id
                    title
                }
            }
        }
    }
`;

export const POST_DELETE_MUTATION = gql`
    mutation DeletePost($input: DeletePostByIdInput!) {
        deletePostById(input: $input) {
            post {
                id
                content
                categoryByCategoryId {
                    id
                }
            }
        }
    }
`;

export const POST_CATEGORIES_SELECT_QUERY = gql`
    query GetPostCategoriesSelect($filter: CategoryFilter) {
        allCategories(filter: $filter) {
            edges {
                node {
                    id
                    title
                }
            }
            totalCount
        }
    }
`;
