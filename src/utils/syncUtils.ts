import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { PLACE_POS_ORDER_MUTATION } from '../graphql/mutations/posscreen';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncOfflineOrders',
    taskTitle: 'Syncing Offline Orders',
    taskDesc: 'Ensuring all offline orders are synced.',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff0000',
    linkingURI: 'myapp://sync',
    parameters: {
        delay: 1000,
    },
};

// ✅ Modified to prevent app from freezing
const backgroundSyncTask = async (taskData) => {
    try {
        console.log("Running background sync task...");
        await new Promise(async (resolve) => {
            await syncOfflineOrders();
            resolve(); // Mark task as completed
        });
    } catch (error) {
        console.error("Error in background sync task:", error);
    }
};

// ✅ Fix: Run background sync asynchronously
export const startBackgroundSync = async () => {
    console.log("Starting background sync...");
    await BackgroundActions.start(backgroundSyncTask, options);
};

// ✅ Stop Background Sync
export const stopBackgroundSync = async () => {
    console.log("Stopping background sync...");
    await BackgroundActions.stop();
};

// ✅ Sync Offline Orders
export const syncOfflineOrders = async () => {
    try {
        console.log("Starting offline order sync...");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }
        //const storedOrders = await AsyncStorage.getItem('offlineOrders');
        
       
        let offlineOrders = JSON.parse(await AsyncStorage.getItem('offlineOrders'))||[];
        //console.log(offlineOrders?.length)
        //console.log(offlineOrders)
        if (offlineOrders?.length==0) {
            console.log("No offline orders to sync.");
            return;
        }
        let remainingOrders = [];
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('Device is offline, skipping sync.');
            return;
        }
        for (const order of offlineOrders) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: PLACE_POS_ORDER_MUTATION,
                        variables: { input: order },
                    });
                    success = true;
                    console.log("Order synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingOrders.push(order);
            }
        }

        // ✅ Update AsyncStorage with only unsynced orders
        await AsyncStorage.setItem('offlineOrders', JSON.stringify(remainingOrders));

        console.log('Offline order sync completed.');
    } catch (error) {
        console.error('Error syncing offline orders:', error);
    }
};
