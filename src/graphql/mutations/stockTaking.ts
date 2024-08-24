import { gql } from '@apollo/client';

// Mutation to create a stock take
export const STOCK_TAKE_MUTATION = gql`
  mutation CreateStockTake($input: StockTakeInput!) {
    createStockTake(input: $input) {
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
      product_name
      physical_count
      system_count
      reconciliation_difference
      taken_at
    }
  }
`;
