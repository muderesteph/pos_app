import React, { useEffect, useState } from 'react';
import { View,Button, Text, Alert, TouchableOpacity, TextInput, Dimensions, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { listCashCollectionsQuery, addCashCollectionMutation, deleteCashCollectionMutation } from '../graphql/mutations/addCashCollection';

const { width, height } = Dimensions.get('window');

const CashCollectionsScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { data, refetch } = useQuery(listCashCollectionsQuery);
  const [addCashCollection] = useMutation(addCashCollectionMutation);
  const [deleteCashCollection] = useMutation(deleteCashCollectionMutation);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncOfflineData = async () => {
    const offlineCollections = JSON.parse(await AsyncStorage.getItem('offlineCollections')) || [];
    for (const collection of offlineCollections) {
      await addCashCollection({ variables: collection });
    }
    await AsyncStorage.removeItem('offlineCollections');
    refetch();
  };

  const handleAddCollection = async () => {
    if (amount.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    const collection = {
      amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
      collected_at: createdAt.toISOString().split('T')[0], // Format date as yyyy-m-d
    };

    if (isOnline) {
      await addCashCollection({ variables: collection });
      refetch();
      Alert.alert('Success', 'Cash collection added successfully.');
    } else {
      const offlineCollections = JSON.parse(await AsyncStorage.getItem('offlineCollections')) || [];
      offlineCollections.push(collection);
      await AsyncStorage.setItem('offlineCollections', JSON.stringify(offlineCollections));
      Alert.alert('Offline', 'Cash collection saved locally.');
    }

    setAmount(''); // Clear the amount field after submission
  };

  const handleDeleteCollection = async (id) => {
    if (isOnline) {
      await deleteCashCollection({ variables: { id } });
      refetch();
    } else {
      Alert.alert('Action not available offline', 'You need to be online to delete a cash collection.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCreatedAt(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.active_page}>
        <Text>Cash Collections</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>{createdAt.toISOString().split('T')[0]}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={createdAt}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Button title="Add Collection" onPress={handleAddCollection} />
        </View>

        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Date</Text>
              <Text style={styles.tableHeader}>Amount</Text>
              <Text style={styles.tableHeaderCenter}>Actions</Text>
            </View>

            {data?.listCashCollections?.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.tableCell}>{item.collected_at}</Text>
                <Text style={styles.tableCell}>{item.amount}</Text>
                <TouchableOpacity style={styles.tableCell} onPress={() => handleDeleteCollection(item.id)}>
                  <Icon name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.menu_page}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setDropdownVisible(true)}>
          <Icon name="bars" size={30} color="#000" />
        </TouchableOpacity>
        <DropdownMenu isVisible={isDropdownVisible} onClose={() => setDropdownVisible(false)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  datePickerButton: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: width * 0.04,
    color: '#333',
  },
  active_page: {
    position: 'relative',
    overflow: 'scroll',
    height: height * 0.85,
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
  toggleButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#eee',
  },
  table: {
    width: '100%',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    fontWeight: 'bold',
    width: width * 0.3,
    // flex: 1,
    // textAlign: 'center',
    fontSize: width * 0.04, 
  },
  tableHeaderCenter:{
    fontWeight: 'bold',
    width: width * 0.3,
    flex: 1,
    textAlign: 'center',
    fontSize: width * 0.04, 
  },
  tableCell: {
    width: width * 0.3,
    alignItems: 'center',
  },
});

export default CashCollectionsScreen;
