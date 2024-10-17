
import { gql } from '@apollo/client';

export const listMissingStocksQuery = gql`
  query {
    latestMissingStocks {
      id
      product_id
      product_name
      qty
      selling_price
      created_at
    }
  }
`;

export const addMissingStockMutation = gql`
  mutation addMissingStock($input: AddMissingStockInput!) {
    addMissingStock(input: $input) {
       stock {
            id
            product_id
            product_name
            qty
            selling_price
            created_at
        }
    }
  }
`;

export const deleteMissingStockMutation = gql`
  mutation deleteMissingStock($id: ID!) {
    deleteMissingStock(id: $id) {
      success
    }
  }
`;

export const PRODUCTS_QUERY = gql`
query posProducts {
    posProducts {
        id
        name
        priceHtml {
          finalPrice
        }
    }
  }
`;
