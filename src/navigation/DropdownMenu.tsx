import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { AdminAuthScreenNavigationProp, RootStackParamList } from './RootStackParamList';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DropdownMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation<AdminAuthScreenNavigationProp>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Assume that when an admin logs in, you store 'isAdmin' as "true" in AsyncStorage.
      const adminFlag = await AsyncStorage.getItem('isAdmin');
      setIsAdmin(adminFlag === 'true');
    };
    checkAdminStatus();
  }, []);

  const navigateWithAdminAuth = (screenName: keyof RootStackParamList) => {
    onClose();
    navigation.navigate('AdminAuth', { screenName });
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('POSMAIN')}>
            <Icon name="shopping-cart" size={20} color="#000" />
            <Text style={styles.menuText}>POS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderedProducts')}>
            <Icon name="shopping-cart" size={20} color="#000" />
            <Text style={styles.menuText}>Sold Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('InternalConsumption')}>
            <Icon name="list" size={20} color="#000" />
            <Text style={styles.menuText}>Internal Consumption</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('StockReco')}>
            <Icon name="list" size={20} color="#000" />
            <Text style={styles.menuText}>Stock Reco</Text>
          </TouchableOpacity>
          {isAdmin && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CashCollections')}>
                <Icon name="credit-card" size={20} color="#000" />
                <Text style={styles.menuText}>Cash Collections</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('StockItems')}>
                <Icon name="cube" size={20} color="#000" />
                <Text style={styles.menuText}>Stock Items</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PriceAdjustments')}>
                <Icon name="tag" size={20} color="#000" />
                <Text style={styles.menuText}>Price Adjustments</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('About')}>
            <Icon name="shopping-cart" size={20} color="#000" />
            <Text style={styles.menuText}>About</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default DropdownMenu;
