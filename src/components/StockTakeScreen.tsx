import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQuery } from '@apollo/client';
import { STOCK_TAKE_MUTATION } from '../graphql/mutations/stockTaking';
import { PRODUCTS_QUERY } from '../graphql/mutations/posscreen';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const StockTakingScreen = () => {
  const [physicalCount, setPhysicalCount] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const { data, loading, error } = useQuery(PRODUCTS_QUERY);
  const [createStockTake] = useMutation(STOCK_TAKE_MUTATION);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const handleSubmit = async () => {
    const selectedProductData = data.allProducts.data.find(product => product.id === selectedProduct);
    const systemCount = selectedProductData.inventories[0]?.qty || 0;
    const takenAt = new Date().toISOString();

    await createStockTake({
      variables: {
        product_id: selectedProduct,
        physical_count: parseInt(physicalCount),
        system_count: systemCount,
        taken_at: takenAt
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.active_page}>
        <Text>Select Product</Text>
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(itemValue, itemIndex) => setSelectedProduct(itemValue)}
        >
          {data.allProducts.data.map(product => (
            <Picker.Item label={product.name} value={product.id} key={product.id} />
          ))}
        </Picker>

        <TextInput
          placeholder="Physical Count"
          value={physicalCount}
          onChangeText={setPhysicalCount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button title="Submit Stock Take record" onPress={handleSubmit} />
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
  active_page: {
    position: 'relative',
    height: height * 0.65,
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
});

export default StockTakingScreen;
