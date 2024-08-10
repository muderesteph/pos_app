import { gql } from '@apollo/client';

export const listStocksQuery = gql`
  query ListStocks {
    latestStocks {
      id
      product_id
      product_name
      qty
      selling_price
      created_at
    }
  }
`;

export const addStockMutation = gql`
  mutation AddStock($input: AddStockInput!) {
    addStock(input: $input) {
      stock {
        id
        product_id
        product_name
        qty
        selling_price
        created_at
      }
      message
    }
  }
`;

export const deleteStockMutation = gql`
  mutation DeleteStock($id: ID!) {
    deleteStock(id: $id) {
      success
      message
    }
  }
`;
