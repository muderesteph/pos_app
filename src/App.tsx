import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider,ApolloLink,HttpLink} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo from '@react-native-community/netinfo';
import TestScreen from './components/TestScreen';
import LoginScreen from './components/LoginScreen';
import AdminAuthScreen from './components/AdminAuthScreen';
import CashCollectionsScreen from './components/CashCollectionsScreen';
import PriceAdjustmentsScreen from './components/PriceAdjustmentsScreen';
import PosScreen from './components/PosScreen';
import StockRecoScreen from './components/StockRecoScreen';
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
import { startPriceAdjustmentsBackgroundSync } from './utils/syncPriceAdjustments'; // ✅ Import background sync
import { startCashCollectionsBackgroundSync } from './utils/syncCashCollections'; // ✅ Import background sync
import { startInternalConsumptionsBackgroundSync } from './utils/syncInternalConsumption'; // ✅ Import background sync












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


  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
                PermissionsAndroid.PERMISSIONS.WAKE_LOCK,
                PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
                PermissionsAndroid.PERMISSIONS.RECEIVE_BOOT_COMPLETED,
            ]);

            console.log("Permissions result:", granted); // ✅ Debugging

            if (
                granted[PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.WAKE_LOCK] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.RECEIVE_BOOT_COMPLETED] === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log("✅ All required permissions granted.");
            } else {
                Alert.alert(
                    "Permissions Required",
                    "Some permissions were not granted. This may cause background sync issues."
                );
                console.warn("❌ Some permissions were denied:", granted);
            }
        } catch (err) {
            console.warn("❌ Error requesting permissions:", err);
        }
    }
};

const debugPermissions = async () => {
  const foregroundService = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE);
  const wakeLock = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WAKE_LOCK);
  const accessNetworkState = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE);

  console.log("🔍 Foreground Service:", foregroundService);
  console.log("🔍 Wake Lock:", wakeLock);
  console.log("🔍 Network State:", accessNetworkState);
};

const checkPermissionsBeforeSync = async () => {
  const foregroundService = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE);
  const wakeLock = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WAKE_LOCK);
  const accessNetworkState = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE);

  if (!foregroundService || !wakeLock || !accessNetworkState) {
      console.warn("❌ Required permissions are missing. Cannot start sync.");
      return;
  }

  console.log("✅ All permissions granted, starting sync...");
  //startBackgroundSync();
};

useEffect(() => {
    //requestPermissions();
    //debugPermissions();
    //checkPermissionsBeforeSync();
}, []);





  // useEffect(() => {
  //   const startAllBackgroundSyncs = async () => {
  //     try {
  //       console.log("🔄 Initializing background sync...");
  //       setTimeout(() => {
  //         console.log("✅ Delayed background sync start...");
  //         //startBackgroundSync();
  //     }, 3000); // ✅ Add slight delay to avoid freezing on launch
  //     } catch (error) {
  //       console.error("❌ Error initializing background sync:", error);
  //     }
  //   };
  
  //   startAllBackgroundSyncs();
  // }, []);

  // useEffect(() => {
  //   requestPermissions();
  // }, []);


  // useEffect(() => {
  //   const startAllBackgroundSyncs = async () => {
  //     try {
  //       console.log("🔄 Initializing background sync...");
  //       await requestPermissions(); // Wait for permissions
  //       await startBackgroundSync();
  //     } catch (error) {
  //       console.error("❌ Error initializing background sync:", error);
  //     }
  //   };
  
  //   startAllBackgroundSyncs();
  // }, []);
  useEffect(() => {
    //Initialize background syncing
    //configureBackgroundSync();
    startBackgroundSync();
    startStockTakeBackgroundSync(); 
    startStockItemsBackgroundSync();
    startPriceAdjustmentsBackgroundSync();
    startCashCollectionsBackgroundSync();
    startInternalConsumptionsBackgroundSync();
  }, []);

//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//         console.log(`📶 Network Status: ${state.isConnected ? "Online" : "Offline"}`);
//         if (state.isConnected) {
//             console.log("🚀 Device is back online, syncing orders...");
//             startBackgroundSync();
//             startStockTakeBackgroundSync(); 
//             startStockItemsBackgroundSync();
//             startPriceAdjustmentsBackgroundSync();
//             startCashCollectionsBackgroundSync();
//             startInternalConsumptionsBackgroundSync();
//         }
//     });

//     return () => {
//         unsubscribe();
//     };
// }, []);



  // useEffect(() => {
  //   console.log("🚀 App started, initializing background sync...");

  //   const startAllBackgroundSyncs = async () => {
  //     console.log("🔄 Delayed background sync initialization...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startBackgroundSync(); // Orders sync
  //     console.log("✅ Order sync started...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startStockTakeBackgroundSync();
  //     console.log("✅ Stock Take sync started...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startStockItemsBackgroundSync();
  //     console.log("✅ Stock Items sync started...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startPriceAdjustmentsBackgroundSync();
  //     console.log("✅ Price Adjustments sync started...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startCashCollectionsBackgroundSync();
  //     console.log("✅ Cash Collections sync started...");

  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     startInternalConsumptionsBackgroundSync();
  //     console.log("✅ Internal Consumptions sync started...");
  //   };

  //   startAllBackgroundSyncs();
  // }, []);


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
          <Stack.Screen name="StockReco" component={StockRecoScreen} />
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
