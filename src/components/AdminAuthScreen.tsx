import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@apollo/client';
import { adminLoginMutation } from '../graphql/mutations/adminLogin';

const AdminAuthScreen = ({ route, navigation }) => {
  const { screenName, onSuccess } = route.params;
  const [pin, setPin] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [adminLogin] = useMutation(adminLoginMutation);

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
        const response = await adminLogin({ variables: { pin :pin } });
        if (response.data.posUserLogin.user.roleId === 1) {
          await AsyncStorage.setItem('adminAuthorized', 'true');
          setPin(''); // Clear the PIN after successful authentication
          navigation.navigate(screenName);
        } else {
          Alert.alert('Authentication failed', 'Invalid PIN.');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'Failed to authenticate. Please try again.');
      }
    } else {
      const storedAdminAuthorized = await AsyncStorage.getItem('adminAuthorized');
      if (storedAdminAuthorized === 'true') {
        setPin(''); // Clear the PIN if the user is authorized offline
        navigation.navigate(screenName);
      } else {
        Alert.alert('Error', 'No offline access. Please log in while online.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Admin PIN</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        placeholder="Enter PIN"
        value={pin}
        onChangeText={setPin}
        autoCompleteType="off" // Disable autofill
        onSubmitEditing={handleLogin}
        returnKeyType="done"
      />
      <Button title="Submit" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});

export default AdminAuthScreen;