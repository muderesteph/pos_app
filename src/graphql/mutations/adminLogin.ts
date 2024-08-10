import { gql } from '@apollo/client';

export const adminLoginMutation = gql`
  mutation PosUserLogin($pin: String!) {
    posUserLogin(input: { pin: $pin }) {
      status
      success
      user {
        roleId
      }
    }
  }
`;
