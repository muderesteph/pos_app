import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions, FlatList, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { STOCK_TAKES_QUERY, PRODUCTS_QUERY, deleteStockTakeItemMutation } from '../graphql/mutations/stockTaking';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startStockTakeBackgroundSync } from '../utils/syncStockTakes'; // ✅ Import Background Sync

const { width, height } = Dimensions.get('window');

const StockTakingScreen = () => {
  const [physicalCount, setPhysicalCount] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [localStockTakes, setLocalStockTakes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const { data: productsData, refetch: refetchProducts } = useQuery(PRODUCTS_QUERY, {
    variables: { datetime: date.toISOString().split('T')[0] },
  });
  const { data: stockTakesData, refetch: refetchStocks } = useQuery(STOCK_TAKES_QUERY, {
    fetchPolicy: 'network-only',  
    variables: { datetime: date.toISOString().split('T')[0] },
  });

  useEffect(() => {
    checkLocalStockTakes();
  }, []);

  useEffect(() => {
    if (productsData && productsData.allStockTakeProducts.length > 0) {
      setSelectedProduct(productsData.allStockTakeProducts[0].id);
    }
  }, [productsData]);

  const checkLocalStockTakes = async () => {
    const localData = await AsyncStorage.getItem('localStockTakes');
    if (localData) {
      setLocalStockTakes(JSON.parse(localData));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      refetchStocks();
      refetchProducts();
    }
  };

  const handleSubmitOffline = async () => {
    const stockTake = {
      product_id: selectedProduct,
      physical_count: physicalCount,
      taken_at: date.toISOString().split('T')[0], 
    };

    // ✅ Store locally
    const updatedStockTakes = [...localStockTakes, stockTake];
    await AsyncStorage.setItem('localStockTakes', JSON.stringify(updatedStockTakes));
    setLocalStockTakes(updatedStockTakes);
    Alert.alert('Offline', 'Stock take saved locally.');

    // ✅ Start background sync process
    startStockTakeBackgroundSync();

    // Reset form
    setPhysicalCount('');
    const currentIndex = productsData.allStockTakeProducts.findIndex(product => product.id === selectedProduct);
    setSelectedProduct(
      currentIndex < productsData.allStockTakeProducts.length - 1
        ? productsData.allStockTakeProducts[currentIndex + 1].id
        : productsData.allStockTakeProducts[0].id
    );
  };

  const renderStockTakeItem = ({ item }) => (
    <View style={styles.stockTakeItem}>
      <Text style={styles.itemText}>{item.product_name}</Text>
      <Text style={styles.itemText}>{item.physical_count}</Text>
      <Text style={styles.itemText}>{item.system_count}</Text>
      <Text style={styles.itemText}>{item.reconciliation_difference}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.active_page}>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text>Select Product</Text>
        <Picker selectedValue={selectedProduct} onValueChange={setSelectedProduct}>
          {productsData && productsData.allStockTakeProducts.map(product => (
            <Picker.Item label={product.product_name} value={product.id} key={product.id} />
          ))}
        </Picker>

        <TextInput
          placeholder="Physical Count"
          value={physicalCount}
          onChangeText={setPhysicalCount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          title="Save Stock Take"
          onPress={handleSubmitOffline}
          disabled={isSubmitting}
        />

        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Product Name</Text>
          <Text style={styles.headerText}>Physical count</Text>
          <Text style={styles.headerText}>System count</Text>
          <Text style={styles.headerText}>Diff</Text>
        </View>
        <FlatList
          data={stockTakesData?.stockTakes || []}
          keyExtractor={(item) => item.id}
          style={styles.stockTakeList}
          renderItem={renderStockTakeItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableHeaderCenter:{
    fontWeight: 'bold',
    width: width * 0.3,
    flex: 1,
    textAlign: 'right',
  },
  container: {
    flex: 1,
    padding: 20,
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  toggleButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#eee',
  },
  stockTakeList: {
    marginTop: 20,
    fontSize: width * 0.018
  },
  stockTakeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    flex: 1,
    textAlign: 'left',
    fontSize: width * 0.018, // Responsive font size
  },
  datePickerButton: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: width * 0.04, // Responsive font size
    color: '#333',
  },
  removeItem: {
    color: 'red',
    fontSize: width * 0.05, // Responsive icon size
  },
});

export default StockTakingScreen;
