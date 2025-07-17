import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions, FlatList, Alert,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { STOCK_TAKES_QUERY, PRODUCTS_QUERY, deleteStockTakeItemMutation } from '../graphql/mutations/stockTaking';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startStockTakeBackgroundSync } from '../utils/syncStockTakes'; // ✅ Import Background Sync

const { width, height } = Dimensions.get('window');

const StockRecoScreen = () => {
  const [physicalCount, setPhysicalCount] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [localStockTakes, setLocalStockTakes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [productQuery, setProductQuery] = useState('');

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
    if (productsData && productsData.allStockTakeProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(productsData.allStockTakeProducts[0].id);
      setProductQuery(productsData.allStockTakeProducts[0].product_name);
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
    Alert.alert('Offline', 'Stock reco saved locally.');

    // ✅ Start background sync process
    startStockTakeBackgroundSync();

    // Reset form
    setPhysicalCount('');
    // Cycle to next product if available
    const currentIndex = productsData.allStockTakeProducts.findIndex(product => product.id === selectedProduct);
    const nextIndex = currentIndex < productsData.allStockTakeProducts.length - 1 ? currentIndex + 1 : 0;
    setSelectedProduct(productsData.allStockTakeProducts[nextIndex].id);
    setProductQuery(productsData.allStockTakeProducts[nextIndex].product_name);
  };

  const filteredProducts = productsData?.allStockTakeProducts.filter(product =>
    product.product_name.toLowerCase().includes(productQuery.toLowerCase())
  ) || [];

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
        {/* Date Field - Read Only TextInput */}
        <TextInput
          style={[styles.input, styles.dateInput]}
          value={date.toISOString().split('T')[0]}
          editable={false}
          onTouchStart={() => setShowDatePicker(true)}
        />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text>Select Product</Text>
        {/* Searchable Products Dropdown */}
        <Autocomplete
          data={filteredProducts}
          defaultValue={productQuery}
          onChangeText={text => {
            setProductQuery(text);
            // Clear selection if query changes
            setSelectedProduct('');
          }}
          flatListProps={{
            keyExtractor: item => item.id.toString(),
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => {
                setProductQuery(item.product_name);
                setSelectedProduct(item.id);
              }}>
                <View style={styles.item}>
                  <Text>{item.product_name}</Text>
                </View>
              </TouchableOpacity>
            ),
          }}
          placeholder="Search Product"
          inputContainerStyle={styles.autocompleteInputContainer}
          listContainerStyle={styles.autocompleteListContainer}
          style={styles.input}
        />

        <TextInput
          placeholder="Physical Count"
          value={physicalCount}
          onChangeText={setPhysicalCount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          title="Save Stock Reco"
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
  container: {
    flex: 1,
    padding: 20,
  },
  active_page: {
    position: 'relative',
    height: height * 0.85,
    overflow: 'scroll',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dateInput: {
    backgroundColor: '#f9f9f9',
  },
  autocompleteInputContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 8,
    paddingHorizontal: 8,
    height: 40,
  },
  autocompleteListContainer: {
    maxHeight: 150,
  },
  item: {
    padding: 10,
    marginVertical: 2,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stockTakeList: {
    marginTop: 20,
    fontSize: width * 0.018,
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
    fontSize: width * 0.018,
  },
});

export default StockRecoScreen;