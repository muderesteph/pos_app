import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { addStockMutation} from '../graphql/mutations/addStockItem';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncStockItems',
    taskTitle: 'Syncing Stock Items',
    taskDesc: 'Ensuring all stock items are synced.',
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

// ✅ Function to sync stock items
export const syncStockItems = async () => {
    try {
        console.log("Starting stock items sync...");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }


        //const storedStockItems = await AsyncStorage.getItem('offlineStockItems');
        let stockItems = JSON.parse(await AsyncStorage.getItem('offlineStockItems')) || [];
        //console.log("HHHH")
        //console.log(stockItems)
        if (stockItems?.length==0) {
            console.log("No offline stock items found.");
            return;
        }

        //let stockItems = JSON.parse(storedStockItems);
        let remainingStockItems = [];

        

        for (const stockItem of stockItems) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: addStockMutation,
                        variables: { input: stockItem },
                    });
                    success = true;
                    console.log("Stock item synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingStockItems.push(stockItem);
            }
        }

        // ✅ Update AsyncStorage with only unsynced stock items
        await AsyncStorage.setItem('offlineStockItems', JSON.stringify(remainingStockItems));

        console.log('Stock items sync completed.');
    } catch (error) {
        console.error('Error syncing stock items:', error);
    }
};

// ✅ Background task function
const backgroundStockItemsSyncTask = async () => {
    try {
        //console.log("Running background sync task...");
        await new Promise(async (resolve) => {
        console.log("Running background stock items sync...");
        await syncStockItems();
        });
    } catch (error) {
        console.error("Error in background sync task:", error);
    }
};

// ✅ Start Background Sync
export const startStockItemsBackgroundSync = async () => {
    console.log("Starting background stock items sync...");
    await BackgroundActions.start(backgroundStockItemsSyncTask, options);
};

// ✅ Stop Background Sync
export const stopStockItemsBackgroundSync = async () => {
    console.log("Stopping background stock items sync...");
    await BackgroundActions.stop();
};
