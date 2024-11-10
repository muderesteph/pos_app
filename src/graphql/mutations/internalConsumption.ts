import gql from 'graphql-tag';

export const getInternalConsumptionRecordsQuery = gql`
  query {
    getInternalConsumptionRecords {
      id
      internal_consumption_name {
        id
        name
      }
      product_id
      product_name
      qty
      reason
      consumed_at
    }
  }
`;

export const getInternalConsumptionNamesQuery = gql`
  query {
    getInternalConsumptionNames {
      id
      name
    }
  }
`;

export const addInternalConsumptionMutation = gql`
  mutation AddInternalConsumption($input: AddInternalConsumptionInput!) {
    addInternalConsumption(input: $input) {
      consumption {
        id
        internal_consumption_name {
          id
          name
        }
        product_id
        product_name
        qty
        reason
        consumed_at
      }
      message
    }
  }
`;

export const deleteInternalConsumptionMutation = gql`
  mutation DeleteInternalConsumption($id: ID!) {
    deleteInternalConsumption(id: $id) {
      success
      message
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

// Note: Make sure that the internal_consumption_name_id is correctly referenced
// and used in related screens (AddInternalConsumptionScreen, InternalConsumptionScreen)
// for accurate data processing and representation.
