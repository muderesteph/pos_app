import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome5';  // Updated to version 10.1.0
import { listStocksQuery, deleteStockMutation } from '../graphql/mutations/addStockItem';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const StockItemsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(listStocksQuery);
  const [deleteStockItem] = useMutation(deleteStockMutation); // Add deleteStockItem mutation
  const navigation = useNavigation();

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

  // Handle the delete action with confirmation alert
  const handleDeleteStockItem = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this stock item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            if (isOnline) {
              await deleteStockItem({ variables: { id } });
              refetch(); // Refresh the stock list after deletion
            } else {
              Alert.alert('Action not available offline', 'You need to be online to delete a stock item.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const refreshStocks = async () => {
    // Force re-fetch products and overwrite local storage
    try {
      await refetch(); // This refetches the products from the server
      //await fetchProducts(); // Update local state and save to storage
      Alert.alert('Success', 'Products refreshed from server');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh products');
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Product Name</Text>
      <Text style={styles.headerText}>Quantity</Text>
      <Text style={styles.tableHeaderCenter}>Selling Price</Text>
      <Text style={styles.tableHeaderCenter}><Icon name="tasks" size={20} color="red" /></Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.rowText}>{item.created_at}</Text>
      <Text style={styles.rowText}>{item.product_name}</Text>
      <Text style={styles.rowText}>{item.qty}</Text>
      <Text style={styles.rowText}>{item.selling_price}</Text>
      <TouchableOpacity onPress={() => handleDeleteStockItem(item.id)}>
        <Icon name="trash" size={20} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
       <TouchableOpacity style={styles.refreshButton} onPress={refreshStocks}>
        <Icon name="refresh" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.active_page}>
        <Text>Stock Items</Text>
        {renderTableHeader()}
        <FlatList
          data={data?.latestStocks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <View style={styles.totals_page}>
        <Button title="Add Stock Item" onPress={() => navigation.navigate('AddStockItem')} />
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeaderCenter:{
    fontWeight: 'bold',
    width: width * 0.3,
    flex: 1,
    textAlign: 'right' 
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
    textAlign: 'left',
  },
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005,
    textAlign: 'right',
    height: height * 0.15,
    right: width * 0.01,
    backgroundColor: 'white',
  },
  active_page: {
    position: 'relative',
    height: height * 0.85,
    overflow: 'scroll',
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default StockItemsScreen;
