import { gql } from '@apollo/client';

export const listPriceAdjustmentsQuery = gql`
  query ListPriceAdjustments {
    listPriceAdjustments {
      id
      product_id
      product_name
      amount
      created_at
      sku
      price
    }
  }
`;

export const createPriceAdjustmentMutation = gql`
  mutation CreatePriceAdjustment($product_id: ID!, $amount: String!, $created_at: String!) {
    createPriceAdjustment(input: { product_id: $product_id, amount: $amount, created_at: $created_at }) {
      id
      product_id
      amount
      created_at
      product_name
      sku
      price
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
