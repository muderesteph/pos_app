import React , { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert,TouchableOpacity,Dimensions } from 'react-native';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');


const StockTakeScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  return (
  <View style={styles.container}>
    <View style={styles.active_page}>
       <Text>Welcome to the Stock Take Screen!</Text>
    </View>
    <View style={styles.menu_page}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setDropdownVisible(true)}>
          <Icon name="bars" size={30} color="#000" />
        </TouchableOpacity>
        <DropdownMenu isVisible={isDropdownVisible} onClose={() => setDropdownVisible(false)} />
      </View> 
  </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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

export default StockTakeScreen;
