import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/LoginScreen';

import AdminAuthScreen from './components/AdminAuthScreen';  // Import AdminAuthScreen
import CashCollectionsScreen from './components/CashCollectionsScreen';
import PriceAdjustmentsScreen from './components/PriceAdjustmentsScreen';
import PosScreen from './components/PosScreen';
import StockTakeScreen from './components/StockTakeScreen';

import StockItemsScreen from './components/StockItemsScreen';
import AddStockItemScreen from './components/AddStockItemScreen';


//import CashCollectionsScreen from './components/CashCollectionsScreen';

import { RootStackParamList } from './navigation/RootStackParamList';

const client = new ApolloClient({
  uri: 'https://pos.college.co.zw/graphql',
  cache: new InMemoryCache(),
});

const Stack = createStackNavigator<RootStackParamList>();

const App = () => (
  <ApolloProvider client={client}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="POSMAIN" component={PosScreen} />
        <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />  
        <Stack.Screen name="CashCollections" component={CashCollectionsScreen} /> 
        <Stack.Screen name="PriceAdjustments" component={PriceAdjustmentsScreen} /> 

        <Stack.Screen name="StockItems" component={StockItemsScreen} /> 
        <Stack.Screen name="StockTake" component={StockTakeScreen} /> 
        <Stack.Screen name="AddStockItem" component={AddStockItemScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  </ApolloProvider>
);

export default App;
