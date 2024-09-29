import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Alert, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { gql, useQuery, useMutation } from '@apollo/client';
import DropDownPicker from 'react-native-dropdown-picker';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PRODUCTS_QUERY, PLACE_POS_ORDER_MUTATION } from '../graphql/mutations/posscreen';

const { width, height } = Dimensions.get('window');

const PosScreen = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [amountTendered, setAmountTendered] = useState('');
  const [isOrderButtonDisabled, setIsOrderButtonDisabled] = useState(true); // For disabling order button
  const [change, setChange] = useState(0); // To store the change value
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    skip: !isOnline,
  });
  const [placePosOrder] = useMutation(PLACE_POS_ORDER_MUTATION);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        await fetchProducts();
        await syncOfflineOrders();
      } else {
        await loadProductsFromStorage();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (data && data.allProducts) {
      const productsData = data.allProducts.data.map(product => ({
        label: product.name,
        value: product.id,
        ...product,
      }));
      setProducts(productsData);
      setItems(productsData);
      saveProductsToStorage(productsData);
    }
  }, [data]);

  const fetchProducts = async () => {
    if (loading) return;
    if (error) {
      Alert.alert('Error', 'Failed to fetch products');
      return;
    }
    if (data && data.allProducts) {
      const productsData = data.allProducts.data.map(product => ({
        label: product.name,
        value: product.id,
        ...product,
      }));
      setProducts(productsData);
      setItems(productsData);
    }
  };

  const saveProductsToStorage = async (products) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to storage', error);
    }
  };

  const loadProductsFromStorage = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        setProducts(parsedProducts);
        setItems(parsedProducts);
      }
    } catch (error) {
      console.error('Error loading products from storage', error);
    }
  };

  const parseFloat_nancl = (amnt) => {
    var cas = parseFloat(amnt);
    return isNaN(cas) ? 0 : cas;
  };

  const handleProductSelection = (value) => {
    const product = products.find(p => p.value === value);
    if (product) {
      setSelectedProduct(product);
      addProductToCart(product);
    }
  };

  const addProductToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      Alert.alert('Product already in cart', 'You can update the quantity in the cart.');
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: parseFloat_nancl(product.priceHtml.regularPrice) }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    const newQuantity = parseInt(quantity);
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: isNaN(newQuantity) ? 0 : newQuantity,
          subtotal: (isNaN(newQuantity) ? 0 : newQuantity) * parseFloat(item.priceHtml.regularPrice),
        };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
  };

  const calculateGrandTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
  };

  // Calculate change and disable button based on amount tendered
  useEffect(() => {
    const grandTotal = parseFloat(calculateGrandTotal());
    const tendered = parseFloat(amountTendered);
    
    if (isNaN(tendered) || tendered < grandTotal) {
      setIsOrderButtonDisabled(true);
      setChange(0);
    } else {
      setIsOrderButtonDisabled(false);
      setChange((tendered - grandTotal).toFixed(2));
    }
  }, [amountTendered, cart]);

  const placePosOrderHandler = async () => {
    const orderInput = {
      amountTendered: parseFloat(amountTendered),
      grandTotal: parseFloat(calculateGrandTotal()),
      change: parseFloat(change),
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.priceHtml.regularPrice,
      })),
    };


    if (isOnline) {
      try {
        const { data } = await placePosOrder({ variables: { input: orderInput } });
        Alert.alert('Order Placed v', `Order ID: ${data.placePosOrder.order.id}`);
        setCart([]);
        setAmountTendered(''); // Clear the amount tendered field
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', `Failed to place order: ${error.message}`);
      }
    } else {
      saveOrderToStorage(orderInput);
      Alert.alert('Order Saved', 'Your order will be placed once you are back online');
      setCart([]);
      setAmountTendered(''); // Clear the amount tendered field
    }
  };

  const saveOrderToStorage = async (order) => {
    try {
      const storedOrders = await AsyncStorage.getItem('offlineOrders');
      const offlineOrders = storedOrders ? JSON.parse(storedOrders) : [];
      offlineOrders.push(order);
      await AsyncStorage.setItem('offlineOrders', JSON.stringify(offlineOrders));
    } catch (error) {
      console.error('Error saving order to storage', error);
    }
  };

  const syncOfflineOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('offlineOrders');
      if (storedOrders) {
        const offlineOrders = JSON.parse(storedOrders);
        const successfulOrders = [];

        for (const order of offlineOrders) {
          try {
            await placePosOrder({ variables: { input: order } });
            successfulOrders.push(order);
          } catch (error) {
            console.error('Error syncing offline orders:', error);
          }
        }

        // Remove only successfully synced orders from local storage
        const remainingOrders = offlineOrders.filter(order => !successfulOrders.includes(order));
        await AsyncStorage.setItem('offlineOrders', JSON.stringify(remainingOrders));
      }
    } catch (error) {
      console.error('Error syncing offline orders', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdown_style}>
        <DropDownPicker
          open={open}
          value={selectedProduct?.value}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const value = callback(selectedProduct?.value);
            handleProductSelection(value);
          }}
          setItems={setItems}
          placeholder="Select a product"
          searchable={true}
          searchPlaceholder="Search product..."
        />
      </View>
      <View style={styles.active_page}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Product Name</Text>
          <Text style={styles.headerTextRight}>Quantity</Text>
          <Text style={styles.headerTextRight}>Subtotal</Text>
          <Text style={styles.headerTextRight}><Icon name="tasks" size={20} color="red" /></Text>
        </View>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.cartItem, (item.quantity === 0 || item.subtotal == 0) && styles.cartItemDanger]}>
              <Text style={styles.itemText}>{item.label}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateQuantity(item.id, parseInt(text, 10))}
                  keyboardType="numeric"
                />

                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTextsubtotal}>{item.subtotal.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.removeItem}><Icon name="trash" size={20} color="red" /></Text>
              </TouchableOpacity>
            </View>
          )}
        />
      <View style={styles.blank_forscrolling} />
      </View>

      {/* Grand Total, Amount Tendered, and Change Section */}
      <View style={styles.totals_page}>
        <Text style={styles.grandTotalText}>Grand Total: {calculateGrandTotal()}</Text>
        <TextInput
          placeholder="Amount Tendered"
          style={[
            styles.amountTenderedInput,
            parseFloat(amountTendered) < parseFloat(calculateGrandTotal()) && styles.amountTenderedInputDanger,
          ]}
          value={amountTendered}
          onChangeText={setAmountTendered}
          keyboardType="numeric"
        />
        <Text style={styles.changeText}>Change: {change}</Text>
        <Button
          title="Place Order"
          onPress={placePosOrderHandler}
          style={styles.placeOrderButton}
          disabled={isOrderButtonDisabled} // Disable button based on validation
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
    padding: 16,
  },
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
    width: width * 0.7,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontSize: width * 0.018, // Responsive font size
  },
  headerTextRight: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    fontSize: width * 0.018, // Responsive font size
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  cartItemDanger: {
    backgroundColor: '#ffcccc',
  },
  itemText: {
    width: width * 0.7,
    flex: 1,
    textAlign: 'left',
    fontSize: width * 0.018, // Responsive font size
  },
  itemTextsubtotal: {
    flex: 1,
    textAlign: 'center',
    fontSize: width * 0.018, // Responsive font size
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: width * 0.018, // Responsive button size
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  blank_forscrolling: {
    height: height * 0.05,
  },
  quantityInput: {
    width: width * 0.05, // Responsive input width
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    fontSize: width * 0.01, // Responsive font size
  },
  grandTotalText: {
    fontWeight: 'bold',
    textAlign: 'right',
    padding: 16,
    fontSize: width * 0.019, // Responsive font size
  },
  amountTenderedInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    padding: 8,
    marginVertical: 10,
    fontSize: width * 0.019,
    textAlign: 'right',
  },
  amountTenderedInputDanger: {
    borderColor: 'red',
  },
  changeText: {
    fontSize: width * 0.019,
    marginBottom: 10,
    textAlign: 'center',
  },
  removeItem: {
    color: 'red',
    fontSize: width * 0.02, // Responsive icon size
  },
  toggleButton: {
    position: 'absolute',
    bottom: 0, // Responsive bottom margin
  },
  placeOrderButton: {
    marginBottom: height * 0.1,  // Push the button up slightly based on screen height
  },
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005, // Responsive bottom position
    textAlign: 'right',
    height: height * 0.25, // Increased height for additional fields
    right: width * 0.01,
    backgroundColor: 'white',
  },
  dropdown_style: {
    height: height * 0.15,
  },
  active_page: {
    position: 'relative',
    overflow: 'scroll',
    height: height * 0.65, // Responsive height
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
});

export default PosScreen;
