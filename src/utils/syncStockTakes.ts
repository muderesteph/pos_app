import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { STOCK_TAKE_MUTATION } from '../graphql/mutations/stockTaking';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncStockTakes',
    taskTitle: 'Syncing Stock Takes',
    taskDesc: 'Ensuring all stock takes are synced.',
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

// ✅ Function to sync stock takes
export const syncStockTakes = async () => {
    try {
        console.log("Starting stock take sync...");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }

        //const storedStockTakes = await AsyncStorage.getItem('localStockTakes');
        let stockTakes = JSON.parse(await AsyncStorage.getItem('localStockTakes'))||[];
        if (stockTakes.length==0) {
            console.log("No offline stock takes found.");
            return;
        }

        
        let remainingStockTakes = [];

        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('Device is offline, skipping sync.');
            return;
        }

        for (const stockTake of stockTakes) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: STOCK_TAKE_MUTATION,
                        variables: { input: stockTake },
                    });
                    success = true;
                    console.log("Stock take synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingStockTakes.push(stockTake);
            }
        }

        // ✅ Update AsyncStorage with only unsynced stock takes
        await AsyncStorage.setItem('localStockTakes', JSON.stringify(remainingStockTakes));

        console.log('Stock take sync completed.');
    } catch (error) {
        console.error('Error syncing stock takes:', error);
    }
};

// ✅ Background task function
const backgroundStockTakeSyncTask = async () => {
    try {
        //console.log("Running background sync task...");
        await new Promise(async (resolve) => {
        console.log("Running background stock take sync...");
        await syncStockTakes();
       });
    } catch (error) {
        console.error("Error in background sync task:", error);
    }
};

// ✅ Start Background Sync
export const startStockTakeBackgroundSync = async () => {
    console.log("Starting background stock take sync...");
    await BackgroundActions.start(backgroundStockTakeSyncTask, options);
};

// ✅ Stop Background Sync
export const stopStockTakeBackgroundSync = async () => {
    console.log("Stopping background stock take sync...");
    await BackgroundActions.stop();
};
