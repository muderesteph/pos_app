// components/DropdownMenu.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { AdminAuthScreenNavigationProp } from './RootStackParamList';

const DropdownMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation<AdminAuthScreenNavigationProp>();

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
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithAdminAuth('CashCollections')}>
            <Icon name="credit-card" size={20} color="#000" />
            <Text style={styles.menuText}>Cash Collections</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithAdminAuth('StockItems')}>
            <Icon name="cube" size={20} color="#000" />
            <Text style={styles.menuText}>Stock Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithAdminAuth('PriceAdjustments')}>
            <Icon name="tag" size={20} color="#000" />
            <Text style={styles.menuText}>Price Adjustments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateWithAdminAuth('StockTake')}>
            <Icon name="list" size={20} color="#000" />
            <Text style={styles.menuText}>Stock Take</Text>
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
