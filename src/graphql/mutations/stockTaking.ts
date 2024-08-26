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

// Query to retrieve all stock takes filtered by date
export const STOCK_TAKES_QUERY = gql`
  query StockTakes($datetime: String!) {
    stockTakes(input: { taken_at: $datetime }) {
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

export const PRODUCTS_QUERY = gql`
  query StockTakes($datetime: String!) {
    allStockTakeProducts(input: { taken_at: $datetime }) {
      id
      sku
      product_name
    }
  }
`;

export const deleteStockTakeItemMutation = gql`
  mutation deleteStockTakeItem($id: ID!) {
    deleteStockTakeItem(id: $id){
        message
        success
    }
  }
`;