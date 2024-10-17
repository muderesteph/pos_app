import React, { useEffect, useState } from 'react';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { listMissingStocksQuery, deleteMissingStockMutation, addMissingStockMutation } from '../graphql/mutations/addMissingStockItem';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const MissingStockItemsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(listMissingStocksQuery);
  const [deleteMissingStockItem] = useMutation(deleteMissingStockMutation);
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
    const offlineMissingStocks = JSON.parse(await AsyncStorage.getItem('offlineMissingStocks')) || [];
    for (const missingStock of offlineMissingStocks) {
      await addMissingStockMutation({ variables: missingStock });
    }
    await AsyncStorage.removeItem('offlineMissingStocks');
    refetch();
  };

  const handleDeleteMissingStockItem = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this missing stock item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            if (isOnline) {
              await deleteMissingStockItem({ variables: { id } });
              refetch(); // Refresh the missing stock list after deletion
            } else {
              Alert.alert('Action not available offline', 'You need to be online to delete a missing stock item.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const refreshMissingStocks = async () => {
    try {
      await refetch();
      Alert.alert('Success', 'Missing stocks refreshed from server');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh missing stocks');
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
      <Text style={styles.rowText}>{moment(item.created_at).format('ddd D MMMM YYYY\nHH:mm')}</Text>
      <Text style={styles.rowText}>{item.product_name}</Text>
      <Text style={styles.rowText}>{item.qty}</Text>
      <Text style={styles.rowText}>{item.selling_price}</Text>
      <TouchableOpacity onPress={() => handleDeleteMissingStockItem(item.id)}>
        <Icon name="trash" size={20} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshMissingStocks}>
        <Icon name="refresh" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.active_page}>
        <Text>Missing Stock Items</Text>
        {renderTableHeader()}
        <FlatList
          data={data?.latestMissingStocks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <View style={styles.totals_page}>
        <Button title="Add Missing Stock Item" onPress={() => navigation.navigate('AddMissingStockItem')} />
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
  tableHeaderCenter: {
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

export default MissingStockItemsScreen;
