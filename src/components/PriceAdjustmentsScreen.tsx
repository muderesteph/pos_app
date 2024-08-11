// Import statements...
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet,TouchableOpacity ,Dimensions} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@apollo/client';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropdownMenu from '../navigation/DropdownMenu';
import { listPriceAdjustmentsQuery } from '../graphql/mutations/createPriceAdjustment';
const { width, height } = Dimensions.get('window');

const PriceAdjustmentsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(listPriceAdjustmentsQuery);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        refetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.active_page}>
      <Text>Price Adjustments</Text>
      <FlatList
        data={data?.listPriceAdjustments}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.product_name} - {item.amount}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
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
    padding: 20,
  },
  item: {
    marginVertical: 10,
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

export default PriceAdjustmentsScreen;
