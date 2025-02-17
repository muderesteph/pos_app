import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { addCashCollectionMutation } from '../graphql/mutations/addCashCollection';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncCashCollections',
    taskTitle: 'Syncing Cash Collections',
    taskDesc: 'Ensuring all cash collections are synced.',
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

// ✅ Function to sync cash collections
export const syncCashCollections = async () => {
    try {
        console.log("Starting cash collections sync...");

        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }

        let cashCollections = JSON.parse(await AsyncStorage.getItem('offlineCashCollections'))||[];
        if (cashCollections?.length==0) {
            console.log("No offline cash collections found.");
            return;
        }

        //let cashCollections = JSON.parse(storedCollections);
        let remainingCollections = [];

        

        for (const collection of cashCollections) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: addCashCollectionMutation,
                        variables: { input: collection },
                    });
                    success = true;
                    console.log("Cash collection synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingCollections.push(collection);
            }
        }

        // ✅ Update AsyncStorage with only unsynced cash collections
        await AsyncStorage.setItem('offlineCashCollections', JSON.stringify(remainingCollections));

        console.log('Cash collections sync completed.');
    } catch (error) {
        console.error('Error syncing cash collections:', error);
    }
};

// ✅ Background task function
const backgroundCashCollectionSyncTask = async () => {
    try {
        //console.log("Running background sync task...");
        await new Promise(async (resolve) => {
            console.log("Running background cash collection sync...");
            await syncCashCollections();
        });
    } catch (error) {
        console.error("Error in background sync task:", error);
    }
};

// ✅ Start Background Sync
export const startCashCollectionsBackgroundSync = async () => {
    console.log("Starting background cash collections sync...");
    await BackgroundActions.start(backgroundCashCollectionSyncTask, options);
};

// ✅ Stop Background Sync
export const stopCashCollectionsBackgroundSync = async () => {
    console.log("Stopping background cash collections sync...");
    await BackgroundActions.stop();
};
