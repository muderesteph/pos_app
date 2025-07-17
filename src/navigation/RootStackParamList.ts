import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  POSMAIN: undefined;
  POSTAB: undefined;
  AdminAuth: undefined;
  CashCollections: undefined;
  StockItems: undefined;
  MissingStockItems: undefined;
  PriceAdjustments: undefined;
  CollectCash: undefined;
  StockReco: undefined;
  AddStockItem: undefined;
  AddMissingStockItem: undefined;
  AddPriceAdjustment:undefined;
  InternalConsumption:undefined;
  AddInternalConsumption:undefined;
  OrderedProducts:undefined;
  About:undefined;
};

// Navigation Prop Types
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockItems'>;
export type MissingStockItemsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MissingStockItems'>;
export type PriceAdjustmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PriceAdjustments'>;
export type PosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'POSTAB'>;
export type CollectCashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CollectCash'>;
export type StockRecoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockReco'>;
export type InternalConsumptionNavigationProp = StackNavigationProp<RootStackParamList, 'InternalConsumption'>;
export type IOrderedProductsNavigationProp = StackNavigationProp<RootStackParamList, 'OrderedProducts'>;
export type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;


// Route Prop Types
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type AdminAuthScreenRouteProp = RouteProp<RootStackParamList, 'AdminAuth'>;
export type CashCollectionsScreenRouteProp = RouteProp<RootStackParamList, 'CashCollections'>;
export type StockItemsScreenRouteProp = RouteProp<RootStackParamList, 'StockItems'>; 
export type MissingStockItemsScreenRouteProp = RouteProp<RootStackParamList, 'MissingStockItems'>;
export type PriceAdjustmentsScreenRouteProp = RouteProp<RootStackParamList, 'PriceAdjustments'>;
export type PosScreenScreenRouteProp = RouteProp<RootStackParamList, 'POSMAIN'>;
export type CollectCashScreenRouteProp = RouteProp<RootStackParamList, 'CollectCash'>;
export type StockRecoScreenRouteProp = RouteProp<RootStackParamList, 'StockReco'>;
export type InternalConsumptionScreenRouteProp = RouteProp<RootStackParamList, 'InternalConsumption'>;
export type OrderedProductsRouteProp = RouteProp<RootStackParamList, 'OrderedProducts'>;
export type AboutScreenRouteProp = RouteProp<RootStackParamList, 'About'>;

