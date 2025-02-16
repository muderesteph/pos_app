import React, { useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider,ApolloLink,HttpLink} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
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
import MissingStockItemsScreen from './components/MissingStockItemsScreen';
import AddStockItemScreen from './components/AddStockItemScreen';
import AddMissingStockItemScreen from './components/AddMissingStockItemScreen';
import AddPriceAdjustmentScreen from './components/AddPriceAdjustmentScreen';
import AddInternalConsumptionScreen from './components/AddInternalConsumptionScreen';
import InternalConsumptionScreen from './components/InternalConsumptionScreen';
import AboutScreen from './components/AboutScreen'
import OrderedProductsScreen from './components/OrderedProductsScreen'
import { RootStackParamList } from './navigation/RootStackParamList';
import { startBackgroundSync } from './utils/syncUtils'; // ✅ Ensure correct import
import { startStockTakeBackgroundSync } from './utils/syncStockTakes'; // ✅ Import background sync
import { startStockItemsBackgroundSync } from './utils/syncStockItems'; // ✅ Import Background Sync



// Import the background sync utility
//import { configureBackgroundSync } from './utils/backgroundSync';

// const client = new ApolloClient({
//   uri: 'https://pos.college.co.zw/graphql',
//   cache: new InMemoryCache(),
// });


//if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
// /}

const httpLink = new HttpLink({ uri: 'https://nyimoshop.college.co.zw/graphql' });

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) console.log(`[Network error2]: ${networkError}`);
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
    startBackgroundSync();
    startStockTakeBackgroundSync(); 
    startStockItemsBackgroundSync();
  }, []);

  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* <Stack.Screen name="Test" component={TestScreen} />  */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="POSMAIN" component={PosScreen} />
          <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />
          <Stack.Screen name="CashCollections" component={CashCollectionsScreen} />
          <Stack.Screen name="PriceAdjustments" component={PriceAdjustmentsScreen} />
          <Stack.Screen name="StockItems" component={StockItemsScreen} />
          <Stack.Screen name="MissingStockItems" component={MissingStockItemsScreen} />
          <Stack.Screen name="StockTake" component={StockTakeScreen} />
          <Stack.Screen name="AddStockItem" component={AddStockItemScreen} />
          <Stack.Screen name="AddMissingStockItem" component={AddMissingStockItemScreen} />
          <Stack.Screen name="AddPriceAdjustment" component={AddPriceAdjustmentScreen} />
          <Stack.Screen name="AddInternalConsumption" component={AddInternalConsumptionScreen} />
          <Stack.Screen name="InternalConsumption" component={InternalConsumptionScreen} />
          <Stack.Screen name="OrderedProducts" component={OrderedProductsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;
