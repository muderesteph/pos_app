import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createPriceAdjustmentMutation } from '../graphql/mutations/createPriceAdjustment';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncPriceAdjustments',
    taskTitle: 'Syncing Price Adjustments',
    taskDesc: 'Ensuring all price adjustments are synced.',
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

// ✅ Function to sync price adjustments
export const syncPriceAdjustments = async () => {
    try {
        console.log("Starting price adjustments sync...");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }


        let priceAdjustments = JSON.parse(await AsyncStorage.getItem('offlinePriceAdjustments'))||[];
        if (priceAdjustments?.length==0) {
            console.log("No offline price adjustments found.");
            return;
        }

        //let priceAdjustments = JSON.parse(storedPriceAdjustments);
        let remainingPriceAdjustments = [];

    
        for (const priceAdjustment of priceAdjustments) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: createPriceAdjustmentMutation,
                        variables: priceAdjustment,
                    });
                    success = true;
                    console.log("Price adjustment synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingPriceAdjustments.push(priceAdjustment);
            }
        }

        // ✅ Update AsyncStorage with only unsynced price adjustments
        await AsyncStorage.setItem('offlinePriceAdjustments', JSON.stringify(remainingPriceAdjustments));

        console.log('Price adjustments sync completed.');
    } catch (error) {
        console.error('Error syncing price adjustments:', error);
    }
};

// ✅ Background task function
const backgroundPriceAdjustmentSyncTask = async () => {
    try {
        //console.log("Running background sync task...");
        await new Promise(async (resolve) => {
        console.log("Running background price adjustment sync...");
        await syncPriceAdjustments();
            });
    } catch (error) {
        console.error("Error in background sync task:", error);
    }
};

// ✅ Start Background Sync
export const startPriceAdjustmentsBackgroundSync = async () => {
    console.log("Starting background price adjustments sync...");
    await BackgroundActions.start(backgroundPriceAdjustmentSyncTask, options);
};

// ✅ Stop Background Sync
export const stopPriceAdjustmentsBackgroundSync = async () => {
    console.log("Stopping background price adjustments sync...");
    await BackgroundActions.stop();
};
