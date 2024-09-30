import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@apollo/client';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropdownMenu from '../navigation/DropdownMenu';
import { listPriceAdjustmentsQuery } from '../graphql/mutations/createPriceAdjustment';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';  // Import moment for date formatting


const { width, height } = Dimensions.get('window');

const PriceAdjustmentsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(listPriceAdjustmentsQuery);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        refetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshData = () => {
    refetch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Adjustments</Text>
        <TouchableOpacity onPress={refreshData}>
          <Icon name="refresh" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Product Name</Text>
          <Text style={styles.headerText}>Amount</Text>
          <Text style={styles.headerText}>Old Price</Text>
          <Text style={styles.headerText}>New Price</Text>
          <Text style={styles.headerText}>Added At</Text>
        </View>
        <FlatList
          data={data?.listPriceAdjustments}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.rowText}>{item.product_name}</Text>
              <Text style={styles.rowText}>{item.amount}</Text>
              <Text style={styles.rowText}>{item.old_price}</Text>
              <Text style={styles.rowText}>{item.new_price}</Text>
              <Text style={styles.rowText}>{moment(item.added_at).format('ddd D MMMM YYYY HH:mm')}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <View style={styles.totals_page}>
        <Button title="Add Price Adjustment" onPress={() => navigation.navigate('AddPriceAdjustment')} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
  },
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005,
    textAlign: 'right',
    height: height * 0.15,
    right: width * 0.01,
    backgroundColor: 'white',
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
});

export default PriceAdjustmentsScreen;
