import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StockTakeScreen = () => (
  <View style={styles.container}>
    <Text>Welcome to the Stock Take Screen!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default StockTakeScreen;
