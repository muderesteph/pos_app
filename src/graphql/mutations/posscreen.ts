import { gql } from '@apollo/client';

export const PRODUCTS_QUERY = gql`
  query PosProducts {
    posProducts {
      id
      sku
      name
      priceHtml {
        finalPrice
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