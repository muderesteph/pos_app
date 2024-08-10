// Import statements...
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import { listStocksQuery, addStockMutation, deleteStockMutation } from '../graphql/mutations/addStockItem';

const StockItemsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { data, refetch } = useQuery(listStocksQuery);
  const [addStockItem] = useMutation(addStockMutation);
  const [deleteStockItem] = useMutation(deleteStockMutation);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncOfflineData = async () => {
    const offlineStocks = JSON.parse(await AsyncStorage.getItem('offlineStocks')) || [];
    for (const stock of offlineStocks) {
      await addStockItem({ variables: stock });
    }
    await AsyncStorage.removeItem('offlineStocks');
    refetch();
  };

  const handleAddStockItem = async (stock) => {
    if (isOnline) {
      await addStockItem({ variables: stock });
      refetch();
    } else {
      const offlineStocks = JSON.parse(await AsyncStorage.getItem('offlineStocks')) || [];
      offlineStocks.push(stock);
      await AsyncStorage.setItem('offlineStocks', JSON.stringify(offlineStocks));
    }
  };

  const handleDeleteStockItem = async (id) => {
    if (isOnline) {
      await deleteStockItem({ variables: { id } });
      refetch();
    } else {
      Alert.alert('Action not available offline', 'You need to be online to delete a stock item.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Stock Items</Text>
      <FlatList
        data={data?.latestStocks}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.product_name} - {item.qty}</Text>
            <Button title="Delete" onPress={() => handleDeleteStockItem(item.id)} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <Button title="Add Stock Item" onPress={() => handleAddStockItem({ product_id: '1', qty: 10, selling_price: '100', created_at: new Date().toISOString() })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    marginVertical: 10,
  },
});

export default StockItemsScreen;
