// src/utils/backgroundSync.ts
import BackgroundFetch from 'react-native-background-fetch';

export const configureBackgroundSync = () => {
  const syncAllPendingData = async () => {
    // Call sync functions for different data (orders, stock, etc.)
    await syncPendingOrders();
    await syncPendingStockItems();
    await syncPendingCashCollections();
  };

  const syncPendingOrders = async () => {
    // Add your logic for syncing orders
    console.log("Syncing pending orders...");
  };

  const syncPendingStockItems = async () => {
    // Add your logic for syncing stock items
    console.log("Syncing pending stock items...");
  };

  const syncPendingCashCollections = async () => {
    // Add your logic for syncing cash collections
    console.log("Syncing pending cash collections...");
  };

  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // Sync every 15 minutes
    },
    syncAllPendingData,
    (error) => console.warn('Background fetch failed to start', error)
  );
};
