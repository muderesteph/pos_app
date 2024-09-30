import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { createPriceAdjustmentMutation,PRODUCTS_QUERY } from '../graphql/mutations/createPriceAdjustment';
//import { PRODUCTS_QUERY } from '../graphql/queries'; // Import the PRODUCTS_QUERY
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import Autocomplete from 'react-native-autocomplete-input';
import moment from 'moment'; // For date formatting

const AddPriceAdjustmentScreen = ({ navigation }) => {
  const [productId, setProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { data, loading, error } = useQuery(PRODUCTS_QUERY);
  const [createPriceAdjustment] = useMutation(createPriceAdjustmentMutation);

  const filteredProducts = data?.allProducts?.data.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!productId || !amount || !newPrice) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await createPriceAdjustment({
        variables: { product_id: productId, amount, new_price:newPrice,old_price:selectedProduct.priceHtml.finalPrice, product_name: selectedProduct.name, sku:selectedProduct.sku ,  created_at: createdAt.toISOString() },
      });

      Alert.alert('Success', 'Price adjustment created successfully.');
      navigation.goBack(); // Navigate back after successful submission
    } catch (error) {
      console.error('Error creating price adjustment:', error);
      Alert.alert('Error', 'Failed to create price adjustment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Price Adjustment</Text>
      
      <Text>Select Product</Text>
      <Autocomplete
        data={filteredProducts || []}
        defaultValue={query}
        onChangeText={text => {
          setQuery(text);
          setSelectedProduct(null); // Clear selected product when typing
        }}
        flatListProps={{
          keyExtractor: item => item.id.toString(),
          renderItem: ({ item }) => (
            <TouchableWithoutFeedback onPress={() => {
              setQuery(item.name);
              setProductId(item.id);
              setSelectedProduct(item);
              setAmount(''); // Clear amount
              setNewPrice(''); // Clear new price
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

      {selectedProduct && (
        <>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={selectedProduct.name}
            editable={false}
          />
          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            value={selectedProduct.sku}
            editable={false}
          />
          <Text style={styles.label}>Old Price</Text>
          <TextInput
            style={styles.input}
            value={selectedProduct.priceHtml.finalPrice} // Adjust as per your data structure
            editable={false}
          />
        </>
      )}

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Text style={styles.label}>New Price</Text>
      <TextInput
        style={styles.input}
        placeholder="New Price"
        value={newPrice}
        onChangeText={setNewPrice}
        keyboardType="numeric"
      />

      <Button title="Submit" onPress={handleSubmit} />

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
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
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
});

export default AddPriceAdjustmentScreen;
