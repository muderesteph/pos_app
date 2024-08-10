import { gql } from '@apollo/client';

export const addCashCollectionMutation = gql`
  mutation createCashCollection($amount: String!, $created_at: String!) {
    createCashCollection(amount: $amount, created_at: $created_at) {
      id
      amount
      created_at
    }
  }
`;

export const deleteCashCollectionMutation = gql`
  mutation deleteCashCollection($id: ID!) {
    deleteCashCollection(id: $id)
  }
`;

export const listCashCollectionsQuery = gql`
  query {
    listCashCollections {
      id
      amount
      created_at
    }
  }
`;
