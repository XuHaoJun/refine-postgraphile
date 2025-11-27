import gql from "graphql-tag";

export const POSTS_QUERY = gql`
    query GetPosts(
        $first: Int
        $after: Cursor
        $filter: PostFilter
        $orderBy: [PostOrderBy!]
    ) {
        posts(
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
`;

export const POST_QUERY = gql`
    query GetPost($id: ID!) {
        postById(id: $id) {
            id
            title
            content
            categoryId
            category {
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
                category {
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
                category {
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
                category {
                    id
                }
            }
        }
    }
`;

export const POST_CATEGORIES_SELECT_QUERY = gql`
    query GetPostCategoriesSelect($filter: CategoryFilter) {
        categories(filter: $filter) {
            edges {
                node {
                    id
                    rowId
                    title
                }
            }
            totalCount
        }
    }
`;
