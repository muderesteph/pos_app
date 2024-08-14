import gql from 'graphql-tag';

export const listStocksQuery = gql`
  query {
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
  mutation AddStock($product_id: ID!, $qty: Int!, $selling_price: Float!, $created_at: String!) {
    addStock(product_id: $product_id, qty: $qty, selling_price: $selling_price, created_at: $created_at) {
      id
    }
  }
`;

export const deleteStockMutation = gql`
  mutation DeleteStock($id: ID!) {
    deleteStock(id: $id) {
      success
    }
  }
`;

export const PRODUCTS_QUERY = gql`
query AllProducts {
    allProducts {
      data {
        id
        name
      }
    }
  }
`;
