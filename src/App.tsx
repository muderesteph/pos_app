import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/LoginScreen';
import PosTabs from './navigation/PosTabs';
import AdminAuthScreen from './components/AdminAuthScreen';  // Import AdminAuthScreen
import { RootStackParamList } from './navigation/RootStackParamList';

const client = new ApolloClient({
  uri: 'http://pos.college.co.zw/graphql',
  cache: new InMemoryCache(),
});

const Stack = createStackNavigator<RootStackParamList>();

const App = () => (
  <ApolloProvider client={client}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="POS" component={PosTabs} />
        <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />  
      </Stack.Navigator>
    </NavigationContainer>
  </ApolloProvider>
);

export default App;
