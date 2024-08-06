import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CollectCashScreen = () => (
  <View style={styles.container}>
    <Text>Welcome to the Collect Cash Screen!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default CollectCashScreen;
