import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import { listCashCollectionsQuery, addCashCollectionMutation, deleteCashCollectionMutation } from '../graphql/mutations/addCashCollection';

const CashCollectionsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { data, refetch } = useQuery(listCashCollectionsQuery);
  const [addCashCollection] = useMutation(addCashCollectionMutation);
  const [deleteCashCollection] = useMutation(deleteCashCollectionMutation);

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
    const offlineCollections = JSON.parse(await AsyncStorage.getItem('offlineCollections')) || [];
    for (const collection of offlineCollections) {
      await addCashCollection({ variables: collection });
    }
    await AsyncStorage.removeItem('offlineCollections');
    refetch();
  };

  const handleAddCollection = async (collection) => {
    if (isOnline) {
      await addCashCollection({ variables: collection });
      refetch();
    } else {
      const offlineCollections = JSON.parse(await AsyncStorage.getItem('offlineCollections')) || [];
      offlineCollections.push(collection);
      await AsyncStorage.setItem('offlineCollections', JSON.stringify(offlineCollections));
    }
  };

  const handleDeleteCollection = async (id) => {
    if (isOnline) {
      await deleteCashCollection({ variables: { id } });
      refetch();
    } else {
      Alert.alert('Action not available offline', 'You need to be online to delete a cash collection.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Cash Collections</Text>
      <FlatList
        data={data?.listCashCollections}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.amount}</Text>
            <Button title="Delete" onPress={() => handleDeleteCollection(item.id)} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <Button title="Add Collection" onPress={() => handleAddCollection({ amount: '100', created_at: new Date().toISOString() })} />
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

export default CashCollectionsScreen;
