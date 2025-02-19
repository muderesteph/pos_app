import { gql } from '@apollo/client';

export const listPriceAdjustmentsQuery = gql`
  query ListPriceAdjustments {
    listPriceAdjustments {
      id
      product_id
      product_name
      amount
      added_at
      sku
      old_price
      new_price
    }
  }
`;

export const createPriceAdjustmentMutation = gql`
  mutation CreatePriceAdjustment(
    $product_id: ID!,
    $amount: String!,
    $created_at: String!,
    $new_price: String!,
    $old_price: String!,
    $product_name: String!,
    $sku: String!
  ) {
    createPriceAdjustment(input: { 
      product_id: $product_id, 
      amount: $amount, 
      created_at: $created_at, 
      new_price: $new_price, 
      old_price: $old_price, 
      product_name: $product_name, 
      sku: $sku 
    }) {
      message
      price_adjustment {
        id
        product_id
        amount
        added_at
        product_name
        sku
        old_price
        new_price
      }
    }
  }
`;


export const deletePriceAdjustmentMutation = gql`
  mutation DeletePriceAdjustment($id: ID!) {
    deletePriceAdjustment(id: $id) {
      success
      message
    }
  }
`;


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