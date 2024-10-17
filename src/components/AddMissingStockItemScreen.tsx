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
import moment from 'moment';

import { addMissingStockMutation, PRODUCTS_QUERY } from '../graphql/mutations/addMissingStockItem';

const { width, height } = Dimensions.get('window');

const AddMissingStockItemScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [qty, setQty] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();
  const [addMissingStock] = useMutation(addMissingStockMutation);

  const { data, loading, error, refetch } = useQuery(PRODUCTS_QUERY);

  const handleAddMissingStockItem = async () => {
    if (isSubmitting) return;

    if (!selectedProduct || !sellingPrice || !qty || !reason) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const missingStock = {
      product_id: selectedProduct,
      qty: qty,
      selling_price: sellingPrice,
      reason: reason,
      created_at: createdAt.toISOString(),
    };

    setIsSubmitting(true);

    try {
      if (isOnline) {
        await addMissingStock({ variables: { input: missingStock } });
      } else {
        const offlineMissingStocks = JSON.parse(await AsyncStorage.getItem('offlineMissingStocks')) || [];
        offlineMissingStocks.push(missingStock);
        await AsyncStorage.setItem('offlineMissingStocks', JSON.stringify(offlineMissingStocks));
      }

      navigation.navigate('MissingStockItems');
    } catch (error) {
      Alert.alert('Error', 'Failed to add missing stock item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDatePicker = () => setShowDatePicker(true);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCreatedAt(selectedDate);
    }
  };

  const filteredProducts = data?.posProducts?.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const refreshProducts = async () => {
    try {
      await refetch();
      Alert.alert('Success', 'Products refreshed from server');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh products');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshProducts}>
        <Icon name="refresh" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.active_page}>
        <Text>Select Product</Text>
        <Autocomplete
          data={filteredProducts || []}
          defaultValue={query}
          onChangeText={text => {
            setQuery(text);
            setSelectedProduct('');
          }}
          flatListProps={{
            keyExtractor: item => item.id.toString(),
            renderItem: ({ item }) => (
              <TouchableWithoutFeedback onPress={() => {
                setQuery(item.name);
                setSelectedProduct(item.id);
                setSellingPrice(item.priceHtml.finalPrice || '');
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

        <Text>Reason</Text>
        <TextInput
          placeholder="Reason"
          value={reason}
          onChangeText={setReason}
          style={styles.input}
        />

        <Text>Select Date</Text>
        <TextInput
          placeholder="Select Date"
          value={moment(createdAt).format('YYYY-MM-DD')}
          onFocus={openDatePicker}
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
        <Button
          title={isSubmitting ? "Submitting..." : "Add Missing Stock"}
          onPress={handleAddMissingStockItem}
          disabled={isSubmitting}
        />
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
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  autocompleteInputContainer: {
    borderColor: 'gray',
    borderWidth: 1,
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
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005,
    textAlign: 'right',
    height: height * 0.15,
    right: width * 0.01,
    backgroundColor: 'white',
  },
  buttonSpacing: {
    height: 10,
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
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

export default AddMissingStockItemScreen;
