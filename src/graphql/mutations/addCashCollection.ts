import { gql } from '@apollo/client';

export const addCashCollectionMutation = gql`
  mutation createCashCollection($amount: String!, $collected_at: String!) {
    createCashCollection(amount: $amount, collected_at: $collected_at) {
      id
      amount
      collected_at
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
      collected_at
    }
  }
`;
