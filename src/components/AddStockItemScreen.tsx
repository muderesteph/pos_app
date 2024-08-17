import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import Autocomplete from 'react-native-autocomplete-input';
import moment from 'moment';  // Import moment for date formatting

import { addStockMutation, PRODUCTS_QUERY } from '../graphql/mutations/addStockItem';

const { width, height } = Dimensions.get('window');

const AddStockItemScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [qty, setQty] = useState(''); // New field for quantity
  const [createdAt, setCreatedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState('');

  const navigation = useNavigation();
  const [addStockItem] = useMutation(addStockMutation);

  const { data, loading, error } = useQuery(PRODUCTS_QUERY);

  const handleAddStockItem = async () => {
    if (!selectedProduct || !sellingPrice || !qty) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const stock = {
      product_id: selectedProduct,
      qty: qty,
      selling_price: sellingPrice,
      created_at: createdAt.toISOString(),
    };

    if (isOnline) {
      //var product_id=stock.product_id
      await addStockItem({ variables: {input:stock} });
    } else {
      const offlineStocks = JSON.parse(await AsyncStorage.getItem('offlineStocks')) || [];
      offlineStocks.push(stock);
      await AsyncStorage.setItem('offlineStocks', JSON.stringify(offlineStocks));
    }

    navigation.navigate('StockItems'); // Redirect back to StockItemsScreen after adding the item
  };

  const openDatePicker = () => setShowDatePicker(true);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCreatedAt(selectedDate);
    }
  };

  const filteredProducts = data?.allProducts?.data.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.active_page}>
        <Text>Select Product</Text>
        <Autocomplete
          data={filteredProducts || []}
          defaultValue={query}
          onChangeText={text => setQuery(text)}
          flatListProps={{
            keyExtractor: item => item.id.toString(),
            renderItem: ({ item }) => (
              <TouchableWithoutFeedback onPress={() => {
                setQuery(item.name);
                setSelectedProduct(item.id);
              }}>
                <View style={styles.item}>
                  <Text>{item.name}</Text>
                </View>
              </TouchableWithoutFeedback>
            ),
          }}
          placeholder="Search Product"
          inputContainerStyle={styles.autocompleteInputContainer}
          listContainerStyle={styles.autocompleteListContainer}
          style={styles.input}
        />
        <Text>Set Quantity</Text>
        <TextInput
          placeholder="Quantity"
          value={qty}
          onChangeText={setQty}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text>Set Selling Price</Text>
        <TextInput
          placeholder="Selling Price"
          value={sellingPrice}
          onChangeText={setSellingPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text>Select Date</Text>
        <TextInput
          placeholder="Select Date"
          value={moment(createdAt).format('YYYY-MM-DD')}  // Display the formatted date in the TextInput
          onFocus={openDatePicker}  // Open the date picker when the input is focused
          style={styles.input}
        />
        {showDatePicker && (
          <DateTimePicker
            value={createdAt}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
      <View style={styles.totals_page}>
        <Button title="Add Stock" onPress={handleAddStockItem} />
        <View style={styles.buttonSpacing} />
        <Button title="Cancel" onPress={() => navigation.goBack()} />
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
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8, // Reduced space between fields
    paddingHorizontal: 8,
  },
  autocompleteInputContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8, // Match the margin with other inputs
    paddingHorizontal: 8,
    height: 40, // Match the height with other inputs
  },
  autocompleteListContainer: {
    maxHeight: 150, // Limit the height of the dropdown list
  },
  item: {
    padding: 10,
    marginVertical: 2,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  Button: {
    margin: 10,
  },
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005,
    textAlign: 'right',
    height: height * 0.15,
    right: width * 0.01,
    backgroundColor: 'white',
  },
  buttonSpacing: {
    height: 10, // Add spacing between buttons
  },
  active_page: {
    position: 'relative',
    overflow: 'scroll',
    height: height * 0.65,
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
});

export default AddStockItemScreen;
