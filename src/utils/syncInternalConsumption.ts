import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { addInternalConsumptionMutation } from '../graphql/mutations/internalConsumption';
import client from '../apolloClient';
import BackgroundActions from 'react-native-background-actions';

// Background sync options
const options = {
    taskName: 'SyncInternalConsumptions',
    taskTitle: 'Syncing Internal Consumptions',
    taskDesc: 'Ensuring all internal consumptions are synced.',
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

// ✅ Function to sync internal consumptions
export const syncInternalConsumptions = async () => {
    try {
        console.log("Starting internal consumptions sync...");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('🚫 Device is offline, skipping sync.');
            return;
        }

        let internalConsumptions = JSON.parse(await AsyncStorage.getItem('offlineInternalConsumptions'))||[];
        if (internalConsumptions.length===0) {
            console.log("No offline internal consumptions found.");
            return;
        }

        //let internalConsumptions = JSON.parse(storedConsumptions);
        let remainingConsumptions = [];

       

        for (const consumption of internalConsumptions) {
            let success = false;
            let attempts = 0;

            while (!success && attempts < 3) {
                try {
                    await client.mutate({
                        mutation: addInternalConsumptionMutation,
                        variables: { input: consumption },
                    });
                    success = true;
                    console.log("Internal consumption synced successfully.");
                } catch (error) {
                    console.error(`Sync attempt ${attempts + 1} failed:`, error);
                    attempts += 1;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                }
            }

            if (!success) {
                remainingConsumptions.push(consumption);
            }
        }

        // ✅ Update AsyncStorage with only unsynced internal consumptions
        await AsyncStorage.setItem('offlineInternalConsumptions', JSON.stringify(remainingConsumptions));

        console.log('Internal consumptions sync completed.');
    } catch (error) {
        console.error('Error syncing internal consumptions:', error);
    }
};

// ✅ Background task function
const backgroundInternalConsumptionSyncTask = async () => {
    console.log("Running background internal consumption sync...");
    //await syncInternalConsumptions();
};

// ✅ Start Background Sync
export const startInternalConsumptionsBackgroundSync = async () => {
    console.log("Starting background internal consumptions sync...");
    //await BackgroundActions.start(backgroundInternalConsumptionSyncTask, options);

     try {
            console.log("Running background sync task...");
            await new Promise(async (resolve) => {
                await syncInternalConsumptions();
                resolve(); // Mark task as completed
            });
        } catch (error) {
            console.error("Error in background sync task:", error);
        }

};

// ✅ Stop Background Sync
export const stopInternalConsumptionsBackgroundSync = async () => {
    console.log("Stopping background internal consumptions sync...");
    await BackgroundActions.stop();
};
