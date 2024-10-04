import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { gql, useMutation } from '@apollo/client';
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';
import { NativeModules } from 'react-native';

// Define the GraphQL mutation for Apollo Client
const LOGIN_MUTATION = gql`
  mutation PosUserLogin {
    posUserLogin(input: { pin: "9819" }) {
      status
      success
      accessToken
      tokenType
      expiresIn
    }
  }
`;



const TestScreen = () => {
  const [login, { data, error, loading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    if (error) {
      console.log('Mutation Error:', error);
    }
    if (data) {
      console.log('Mutation Data:', data);
    }
  }, [data, error]);

  // Apollo Client login handler
  const handleLogin = () => {
    login(); // Execute the Apollo mutation
  };

  // Axios SSL-pinned login handler
  const handleAxiosLogin = async() => {
    try {

      await initializeSslPinning({
        'pos.college.co.zw': {
          includeSubdomains: true,
          publicKeyHashes: [
            '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
          ],
        },
      });
      const response = await fetch('https://pos.college.co.zw/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              posUserLogin(input: { pin: "9819" }) {
                status
                success
                accessToken
              }
            }
          `,
        }),
        sslPinning: {
          certs: ['47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='], // Replace with your actual hash
          hostname: 'pos.college.co.zw',
        },
      });
  
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('SSL Pinning Error:', error);
    }
  };

  return (
    <View>
      <Button title="Login with Apollo" onPress={handleLogin} />
      <Button title="Login with Axios" onPress={handleAxiosLogin} />
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {data && <Text>Login Successful with Apollo</Text>}
    </View>
  );
};

export default TestScreen;
