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
query PosProducts {
    posProducts {
        id
        name
        priceHtml {
          finalPrice
        }
    }
  }
`;
 