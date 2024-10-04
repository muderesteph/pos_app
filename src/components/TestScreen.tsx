import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const TEST_QUERY = gql`
  query {
    __typename
  }
`;

const TestScreen = () => {
  const { data, error, loading } = useQuery(TEST_QUERY);

  useEffect(() => {
    if (error) {
      console.log('Test Query Error:', error);
    }
    if (data) {
      console.log('Test Query Data:', data);
    }
  }, [data, error]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <View><Text>Connected Successfully</Text></View>;
};

export default TestScreen;
