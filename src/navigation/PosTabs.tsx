import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import PosScreen from '../components/PosScreen';
import CollectCashScreen from '../components/CollectCashScreen';
import StockTakeScreen from '../components/StockTakeScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PosTabParamList } from './RootStackParamList';

const Tab = createBottomTabNavigator<PosTabParamList>();

const PosTabs = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <View style={styles.indicatorContainer}>
        <View style={[styles.indicator, { backgroundColor: isOnline ? 'green' : 'red' }]} />
      </View>
      <Tab.Navigator>
      <Tab.Screen
        name="POS"
        component={PosScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon name="shopping-cart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Collect Cash"
        component={CollectCashScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon name="money" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Stock Take"
        component={StockTakeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon name="list" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    bottom:10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PosTabs;
