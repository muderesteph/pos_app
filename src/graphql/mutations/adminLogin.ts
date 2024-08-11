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

export const LOGIN_MUTATION = gql`
  mutation UserLogin($pin: String!) {
    posUserLogin(input: { pin: $pin }) {
      status
      success
      accessToken
      tokenType
      expiresIn
      user {
        id
        name
        email
      }
    }
  }
`;