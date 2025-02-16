import { gql } from '@apollo/client';

export const addCashCollectionMutation = gql`
  mutation createCashCollection($input: AddCashCollectionInput!) {
    createCashCollection(input: $input) {
      cash_collection {
        id
        amount
        collected_at
      }
      message
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
