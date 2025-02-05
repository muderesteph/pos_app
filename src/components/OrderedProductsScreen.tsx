import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { gql } from '@apollo/client';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const GET_ORDERED_PRODUCTS_QUERY = gql`
  query GetposordersProducts {
    getposordersProducts {
      id
      name
      qty
      price
      created_at
      updated_at
    }
  }
`;

const OrderedProductsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(GET_ORDERED_PRODUCTS_QUERY);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshOrderedProducts = async () => {
    try {
      await refetch();
      Alert.alert('Success', 'Ordered products refreshed from server');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh ordered products');
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Product Name</Text>
      <Text style={styles.headerText}>Quantity</Text>
      <Text style={styles.headerText}>Price</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.rowText}>{moment(item.created_at).format('ddd D MMM YYYY HH:mm')}</Text>
      <Text style={styles.rowText}>{item.name}</Text>
      <Text style={styles.rowText}>{item.qty}</Text>
      <Text style={styles.rowText}>{parseFloat(item.price).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshOrderedProducts}>
        <Icon name="refresh" size={30} color="#000" />
      </TouchableOpacity>

      <View style={styles.active_page}>
        <Text>Ordered Products</Text>
        {renderTableHeader()}
        <FlatList
          data={data?.getposordersProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
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
    textAlign: 'left',
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
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
});

export default OrderedProductsScreen;
