import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { gql, useMutation } from '@apollo/client';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { LOGIN_MUTATION } from '../graphql/mutations/adminLogin';



type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [pin, setPin] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    if (isOnline) {
      try {
        const { data } = await login({ variables: { pin } });
        if (data.posUserLogin.status) {
          await AsyncStorage.setItem('token', data.posUserLogin.accessToken);
          await AsyncStorage.setItem('pin', pin);
          navigation.navigate('POSMAIN');
        } else {
          Alert.alert('Login Failed', 'Invalid credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'An error occurred during login');
      }
    } else {
      const storedPin = await AsyncStorage.getItem('pin');
      if (storedPin === pin) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          navigation.navigate('POSMAIN');
        } else {
          Alert.alert('Login Failed', 'No token found');
        }
      } else {
        Alert.alert('Login Failed', 'Invalid offline credentials');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: isOnline ? 'green' : 'red' }]} />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="numeric"
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default LoginScreen;
