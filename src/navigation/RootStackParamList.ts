import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  POSMAIN: undefined;
  POSTAB: undefined;
  AdminAuth: undefined;
  CashCollections: undefined;
  StockItems: undefined;
  PriceAdjustments: undefined;
  CollectCash: undefined;
  StockTake: undefined;
};

// Navigation Prop Types
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockItems'>;
export type PriceAdjustmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PriceAdjustments'>;
export type PosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'POSTAB'>;
export type CollectCashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CollectCash'>;
export type StockTakeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockTake'>;

// Route Prop Types
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenRouteProp = RouteProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenRouteProp = RouteProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenRouteProp = RouteProp<RootStackParamList, 'StockItems'>;
export type PriceAdjustmentsScreenRouteProp = RouteProp<RootStackParamList, 'PriceAdjustments'>;
export type PosScreenScreenRouteProp = RouteProp<RootStackParamList, 'POSMAIN'>;
export type CollectCashScreenRouteProp = RouteProp<RootStackParamList, 'CollectCash'>;
export type StockTakeScreenRouteProp = RouteProp<RootStackParamList, 'StockTake'>;
