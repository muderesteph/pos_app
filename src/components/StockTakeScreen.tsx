import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions, FlatList, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { STOCK_TAKE_MUTATION, STOCK_TAKES_QUERY, PRODUCTS_QUERY } from '../graphql/mutations/stockTaking';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

const StockTakingScreen = () => {
  const [physicalCount, setPhysicalCount] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [localStockTakes, setLocalStockTakes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for button disabling

  //const { data, loading, error } = useQuery(PRODUCTS_QUERY);
  const { data: productsData, refetch: refetchProducts } = useQuery(PRODUCTS_QUERY, {
    variables: { datetime: date.toISOString().split('T')[0] },
  });
  const { data: stockTakesData, refetch:refetchStocks } = useQuery(STOCK_TAKES_QUERY, {
    fetchPolicy: 'network-only',  
    variables: { datetime: date.toISOString().split('T')[0] },
  });
  const [createStockTake] = useMutation(STOCK_TAKE_MUTATION);

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
      refetchStocks(); // Refetch the data when the date is changed
      refetchProducts();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double clicks

    setIsSubmitting(true); // Disable the button on the first click
    console.log(JSON.stringify(productsData.allStockTakeProducts))
    const selectedProductData = productsData.allStockTakeProducts.find(product => product.id === selectedProduct);
    const takenAt = date.toISOString().split('T')[0]; // Format date as yyyy-m-d

    if (physicalCount === '') {
      console.log('empty returning');
      setIsSubmitting(false); // Re-enable the button if validation fails
      return false;
    }

    const stockTake = {
      product_id: selectedProduct,
      physical_count: physicalCount,
      taken_at: takenAt,
    };

    const handleSubmitOnline = async () => {
      await createStockTake({
        variables: { input: stockTake },
      });
      refetchStocks(); // Refresh the list after submission
      refetchProducts();
      Alert.alert('Success', 'Stock take submitted successfully.');
    };

    const handleSubmitOffline = async () => {
      const updatedStockTakes = [...localStockTakes, stockTake];
      await AsyncStorage.setItem('localStockTakes', JSON.stringify(updatedStockTakes));
      Alert.alert('Offline', 'Stock take saved locally.');
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        handleSubmitOnline()
          .then(() => {
            const currentIndex = productsData.allStockTakeProducts.findIndex(product => product.id === selectedProduct);
            if (currentIndex < productsData.allStockTakeProducts.length - 1) {
              setSelectedProduct(productsData.allStockTakeProducts[currentIndex + 1].id);
            } else {
              setSelectedProduct(productsData.allStockTakeProducts[0].id); // Reset to the first product if at the end
            }
            setPhysicalCount(''); // Clear input after submission
            setIsSubmitting(false); // Re-enable the button after successful submission
          })
          .catch(e => {
            console.error('Error during online submission:', e);
            handleSubmitOffline().finally(() => {
              setIsSubmitting(false); // Re-enable the button after offline submission
            });
          });
      } else {
        handleSubmitOffline().finally(() => {
          setIsSubmitting(false); // Re-enable the button after offline submission
        });
      }
    });
  };

  useEffect(() => {
    if (localStockTakes.length > 0) {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          localStockTakes.forEach(async (stockTake) => {
            await createStockTake({
              variables: { input: stockTake },
            });
          });
          AsyncStorage.removeItem('localStockTakes'); // Clear local storage after successful submission
          setLocalStockTakes([]); // Clear local state
          refetchStocks(); // Refresh the list
          refetchProducts();
        }
      });
    }
  }, [localStockTakes]);

  //if (loading) return <Text>Loading...</Text>;
  //if (error) return <Text>Error: {error.message}</Text>;

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
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(itemValue) => setSelectedProduct(itemValue)}
        >
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
          title="Submit Stock Take record"
          onPress={handleSubmit}
          disabled={isSubmitting} // Disable the button if submission is in progress
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
    fontSize: width * 0.04, // Responsive font size
  },
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
  stockTakeList: {
    marginTop: 20,
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
    textAlign: 'center',
    fontSize: width * 0.04, // Responsive font size
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
});

export default StockTakingScreen;
