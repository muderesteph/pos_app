import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity,Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';

import { addStockMutation, PRODUCTS_QUERY } from '../graphql/mutations/addStockItem';

const { width, height } = Dimensions.get('window');


const AddStockItemScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();
  const [addStockItem] = useMutation(addStockMutation);

  const handleAddStockItem = async () => {
    if (!selectedProduct || !sellingPrice) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const stock = {
      product_id: selectedProduct,
      qty: 10, // Assuming qty is 10 for now; can be modified later
      selling_price: sellingPrice,
      created_at: createdAt.toISOString(),
    };

    if (isOnline) {
      await addStockItem({ variables: stock });
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

  return (
    <View style={styles.container}>
       <View style={styles.active_page}>
        <Text>Select Product</Text>
        <TextInput
            placeholder="Product Name"
            value={selectedProduct}
            onChangeText={setSelectedProduct}
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
        <Button title="Select Date" onPress={openDatePicker} />
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
         <Button  title="Add Stock" onPress={handleAddStockItem} />
         <Button  title="Cancel" onPress={() => navigation.goBack()} />
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
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  Button:{
    margin:10
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
    height: height * 0.65, // Responsive height
  },
  menu_page:{
    position: 'absolute',
    bottom: 0,
    left:width*0.01
  },
});

export default AddStockItemScreen;
