import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  POS: undefined;
  AdminAuth: undefined;
  CashCollections: undefined;
  StockItems: undefined;
  PriceAdjustments: undefined;
};

export type PosTabParamList = {
  POSTAB: undefined;
  Settings: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockItems'>;
export type PriceAdjustmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PriceAdjustments'>;

export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenRouteProp = RouteProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenRouteProp = RouteProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenRouteProp = RouteProp<RootStackParamList, 'StockItems'>;
export type PriceAdjustmentsScreenRouteProp = RouteProp<RootStackParamList, 'PriceAdjustments'>;
