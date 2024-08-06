import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  POS: undefined;
};

export type PosTabParamList = {
  POSTAB: undefined;
  Settings: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
// export type PosScreenNavigationProp = StackNavigationProp<PosTabParamList, 'POSTAB'>;
export type SettingsScreenNavigationProp = StackNavigationProp<PosTabParamList, 'Settings'>;

export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
//export type PosScreenRouteProp = RouteProp<PosTabParamList, 'POSTAB'>;
export type SettingsScreenRouteProp = RouteProp<PosTabParamList, 'Settings'>;
