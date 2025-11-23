import gql from "graphql-tag";
import type { DocumentNode } from "graphql";

export const CATEGORIES_QUERY: DocumentNode = gql`
    query GetCategories(
        $first: Int
        $after: Cursor
        $filter: CategoryFilter
        $orderBy: [CategoryOrderBy!]
    ) {
        categories(
            first: $first
            after: $after
            filter: $filter
            orderBy: $orderBy
        ) {
            edges {
                node {
                    id
                    title
                    createdAt
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

export const CATEGORY_CREATE_MUTATION: DocumentNode = gql`
    mutation CreateCategory($input: CreateCategoryInput!) {
        createCategory(input: $input) {
            category {
                id
                title
                createdAt
            }
        }
    }
`;

export const CATEGORY_UPDATE_MUTATION: DocumentNode = gql`
    mutation UpdateCategory($input: UpdateCategoryByIdInput!) {
        updateCategoryById(input: $input) {
            category {
                id
                title
                createdAt
            }
        }
    }
`;
