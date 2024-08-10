import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@apollo/client';
import { adminLoginMutation } from '../graphql/mutations/adminLogin';

const AdminAuthScreen = ({ route, navigation }) => {
  const { screenName } = route.params; // Get the screen name from route params
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
        const response = await adminLogin({ variables: { pin } });
        if (response.data.posUserLogin.user.roleId === 1) {
          await AsyncStorage.setItem('adminAuthorized', 'true');
          navigation.navigate(screenName);  // Navigate to the intended screen
        } else {
          Alert.alert('Error', 'Unauthorized');
        }
      } catch (error) {
        Alert.alert('Error', 'Login failed');
      }
    } else {
      const storedAdminAuthorized = await AsyncStorage.getItem('adminAuthorized');
      if (storedAdminAuthorized === 'true') {
        navigation.navigate(screenName);  // Navigate to the intended screen
      } else {
        Alert.alert('Error', 'No offline access. Please log in while online.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Admin Password</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        placeholder="Enter PIN"
        keyboardType="numeric"
      />
      <Button title="Login" onPress={handleLogin} />
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
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
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
