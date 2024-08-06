import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useMutation } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// Define the types for the navigation stack
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type HomeTabParamList = {
  Home: undefined;
  Settings: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type PosScreenNavigationProp = StackNavigationProp<HomeTabParamList, 'Home'>;
type SettingsScreenNavigationProp = StackNavigationProp<HomeTabParamList, 'Settings'>;

const client = new ApolloClient({
  uri: 'https://tuckshop.college.co.zw/graphql',
  cache: new InMemoryCache(),
});

const LOGIN_MUTATION = gql`
  mutation UserLogin($email: String!, $password: String!) {
    userLogin(input: { email: $email, password: $password }) {
      status
      success
      accessToken
      tokenType
      expiresIn
      user {
        id
        name
        email
      }
    }
  }
`;

type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { data } = await login({ variables: { email, password } });
        if (data.userLogin.status) {
          await AsyncStorage.setItem('token', data.userLogin.accessToken);
          await AsyncStorage.setItem('email', email);
          await AsyncStorage.setItem('password', password);
          Alert.alert('Login Successful', data.userLogin.success);
          navigation.navigate('Home');
        } else {
          Alert.alert('Login Failed', 'Invalid credentials');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred during login');
      }
    } else {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');

      if (storedEmail === email && storedPassword === password) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          Alert.alert('Login Successful', 'Logged in offline');
          navigation.navigate('Home');
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

type PosScreenProps = {
  navigation: PosScreenNavigationProp;
};

const PosScreen = ({ navigation }: PosScreenProps) => (
  <View style={styles.container}>
    <Text>Welcome to the Home Screen!</Text>
    <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
  </View>
);

const SettingsScreen = ({ navigation }: PosScreenProps) => (
  <View style={styles.container}>
    <Text>Welcome to the Settings Screen!</Text>
  </View>
);

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={PosScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const App = () => (
  <ApolloProvider client={client}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  </ApolloProvider>
);

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

export default App;