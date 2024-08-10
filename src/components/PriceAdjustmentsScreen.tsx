// Import statements...
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@apollo/client';
import { listPriceAdjustmentsQuery } from '../graphql/mutations';

const PriceAdjustmentsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
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
});

export default PriceAdjustmentsScreen;
