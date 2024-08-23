import { gql } from '@apollo/client';

// Mutation to create a stock take
export const STOCK_TAKE_MUTATION = gql`
  mutation CreateStockTake($product_id: ID!, $physical_count: Int!, $system_count: Int!, $taken_at: String!) {
    createStockTake(
      input: {
        product_id: $product_id
        physical_count: $physical_count
        system_count: $system_count
        taken_at: $taken_at
      }
    ) {
      message
      stock {
        id
        product_id
        physical_count
        system_count
        reconciliation_difference
        taken_at
      }
    }
  }
`;

// Query to retrieve all stock takes
export const STOCK_TAKES_QUERY = gql`
  query StockTakes {
    stockTakes {
      id
      product_id
      physical_count
      system_count
      reconciliation_difference
      taken_at
    }
  }
`;
