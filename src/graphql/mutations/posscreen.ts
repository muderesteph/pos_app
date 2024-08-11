import { gql } from '@apollo/client';

export const PRODUCTS_QUERY = gql`
  query AllProducts {
    allProducts {
      data {
        id
        sku
        name
        description
        shortDescription
        createdAt
        updatedAt
        inventories {
          qty
          productId
          id
        }
        priceHtml {
          regularPrice
          currencyCode
        }
      }
    }
  }
`;

export const PLACE_POS_ORDER_MUTATION = gql`
  mutation PlacePosOrder($input: PosOrderInputType!) {
    placePosOrder(input: $input) {
      order {
        id
        status
        subTotal
      }
    }
  }
`;