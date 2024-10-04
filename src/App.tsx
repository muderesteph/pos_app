import React, { useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider,ApolloLink,HttpLink} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TestScreen from './components/TestScreen';
import LoginScreen from './components/LoginScreen';
import AdminAuthScreen from './components/AdminAuthScreen';
import CashCollectionsScreen from './components/CashCollectionsScreen';
import PriceAdjustmentsScreen from './components/PriceAdjustmentsScreen';
import PosScreen from './components/PosScreen';
import StockTakeScreen from './components/StockTakeScreen';
import StockItemsScreen from './components/StockItemsScreen';
import AddStockItemScreen from './components/AddStockItemScreen';
import AddPriceAdjustmentScreen from './components/AddPriceAdjustmentScreen';
import AboutScreen from './components/AboutScreen'
import { RootStackParamList } from './navigation/RootStackParamList';

// Import the background sync utility
//import { configureBackgroundSync } from './utils/backgroundSync';

// const client = new ApolloClient({
//   uri: 'https://pos.college.co.zw/graphql',
//   cache: new InMemoryCache(),
// });


const httpLink = new HttpLink({ uri: 'https://pos.college.co.zw/graphql' });

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  useEffect(() => {
    // Initialize background syncing
    //configureBackgroundSync();
  }, []);

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Test" component={TestScreen} /> 
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="POSMAIN" component={PosScreen} />
          <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />
          <Stack.Screen name="CashCollections" component={CashCollectionsScreen} />
          <Stack.Screen name="PriceAdjustments" component={PriceAdjustmentsScreen} />
          <Stack.Screen name="StockItems" component={StockItemsScreen} />
          <Stack.Screen name="StockTake" component={StockTakeScreen} />
          <Stack.Screen name="AddStockItem" component={AddStockItemScreen} />
          <Stack.Screen name="AddPriceAdjustment" component={AddPriceAdjustmentScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;
