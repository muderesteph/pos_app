import React, { useEffect, useState } from 'react';
import { View, Text, Button,FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { listStocksQuery } from '../graphql/mutations/addStockItem';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const StockItemsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const { data, refetch } = useQuery(listStocksQuery);
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

  const handleDeleteStockItem = (id) => {
    navigation.navigate('AdminAuth', { screenName: 'StockItems', onSuccess: async () => {
      if (isOnline) {
        await deleteStockItem({ variables: { id } });
        refetch();
      } else {
        Alert.alert('Action not available offline', 'You need to be online to delete a stock item.');
      }
    } });
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Product Name</Text>
      <Text style={styles.headerText}>Quantity</Text>
      <Text style={styles.headerText}>Selling Price</Text>
      <Text style={styles.headerText}>Actions</Text>
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
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
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
    height: height * 0.65,
    overflow: 'scroll',
  },
  menu_page: {
    // position: 'absolute',
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
