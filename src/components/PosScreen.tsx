import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { gql, useQuery, useMutation } from '@apollo/client';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

const PRODUCTS_QUERY = gql`
  query AllProducts {
    allProducts {
      data {
        id
        sku
        name
        description
        shortDescription
        createdAt
        updatedAt
        inventories {
          qty
          productId
          id
        }
        priceHtml {
          regularPrice
          currencyCode
        }
      }
    }
  }
`;

const PLACE_POS_ORDER_MUTATION = gql`
  mutation PlacePosOrder($input: PosOrderInputType!) {
    placePosOrder(input: $input) {
      order {
        id
        status
        subTotal
      }
    }
  }
`;

const PosScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
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
  const parseFloat_nancl=(amnt)=>{
    var cas=parseFloat(amnt)
     return isNaN(cas)?0:cas;
  }

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

  const placePosOrderHandler = async () => {
    const orderInput = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.priceHtml.regularPrice,
      })),
    };

    if (isOnline) {
      try {
        const { data } = await placePosOrder({ variables: { input: orderInput } });
        Alert.alert('Order Placed', `Order ID: ${data.placePosOrder.order.id}`);
        setCart([]);
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', `Failed to place order: ${error.message}`);
      }
    } else {
      saveOrderToStorage(orderInput);
      Alert.alert('Order Saved', 'Your order will be placed once you are back online');
      setCart([]);
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
        for (const order of offlineOrders) {
          await placePosOrder({ variables: { input: order } });
        }
        await AsyncStorage.removeItem('offlineOrders');
      }
    } catch (error) {
      console.error('Error syncing offline orders', error);
    }
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Product Name</Text>
        <Text style={styles.headerText}>Quantity</Text>
        <Text style={styles.headerText}>Subtotal</Text>
        <Text style={styles.headerText}>Actions</Text>
      </View>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, (item.quantity === 0||item.subtotal==0) && styles.cartItemDanger]}>
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

            <Text style={styles.itemText}>{item.subtotal.toFixed(2)}</Text>
            
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.removeItem}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.grandTotalText}>Grand Total: {calculateGrandTotal()}</Text>
      <Button title="Place Order" onPress={placePosOrderHandler} />
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
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  grandTotalText: {
    fontWeight: 'bold',
    textAlign: 'right',
    padding: 16,
  },
  removeItem: {
    color: 'red',
  },
});

export default PosScreen;
