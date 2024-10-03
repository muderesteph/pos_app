import { gql } from '@apollo/client';


export const GET_LATEST_VERSION = gql`
 query {
  latestVersion {
    version
    download_url
  }
}
`;
