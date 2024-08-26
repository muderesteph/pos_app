import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert,TouchableOpacity,Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { listCashCollectionsQuery, addCashCollectionMutation, deleteCashCollectionMutation } from '../graphql/mutations/addCashCollection';

const { width, height } = Dimensions.get('window');

const CashCollectionsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
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
      <View style={styles.active_page}>
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
      </View>

      <View style={styles.totals_page}>
         <Button title="Add Collection" onPress={() => handleAddCollection({ amount: '100', created_at: new Date().toISOString() })} />
      </View>

      <View style={styles.menu_page}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setDropdownVisible(true)}>
          <Icon name="bars" size={30} color="#000" />
        </TouchableOpacity>
        <DropdownMenu isVisible={isDropdownVisible} onClose={() => setDropdownVisible(false)} />
      </View> 
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
  totals_page:{
    position: 'absolute',
    bottom: height * 0.005, // Responsive bottom position
    textAlign: 'right',
    height: height * 0.15, // Responsive height
    //top:height * 0.48,
    right:width*0.01,
    backgroundColor:'white'
  },
  active_page:{
    position: 'relative',
    //bottom: height * 0.05, // Responsive bottom position
    overflow: 'scroll',
    height: height * 0.85, // Responsive height
  },
  menu_page:{
    position: 'absolute',
    bottom: 0,
    left:width*0.01
  },
});

export default CashCollectionsScreen;
