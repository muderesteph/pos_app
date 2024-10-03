import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, TouchableOpacity, TextInput, Dimensions, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';  // Updated to version 6.5.0
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome5';  // Updated to version 10.1.0
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
    const successfulIds = [];

    for (const collection of offlineCollections) {
      try {
        await addCashCollection({ variables: collection });
        successfulIds.push(collection.id); // Collect successful submissions
      } catch (error) {
        console.error('Error syncing collection:', error);
      }
    }

    // Remove only successfully synced collections from local storage
    const remainingCollections = offlineCollections.filter(
      collection => !successfulIds.includes(collection.id)
    );
    await AsyncStorage.setItem('offlineCollections', JSON.stringify(remainingCollections));

    refetch();
  };

  const handleAddCollection = async () => {
    if (amount.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    const collection = {
      id: Date.now(), // Unique ID for offline storage
      amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
      collected_at: createdAt.toISOString().split('T')[0], // Format date as yyyy-m-d
    };

    if (isOnline) {
      try {
        await addCashCollection({ variables: collection });
        refetch();
        Alert.alert('Success', 'Cash collection added successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to add collection online.');
      }
    } else {
      const offlineCollections = JSON.parse(await AsyncStorage.getItem('offlineCollections')) || [];
      offlineCollections.push(collection);
      await AsyncStorage.setItem('offlineCollections', JSON.stringify(offlineCollections));
      Alert.alert('Offline', 'Cash collection saved locally.');
    }

    setAmount(''); // Clear the amount field after submission
  };

  const handleDeleteCollection = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this cash collection?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (isOnline) {
              try {
                await deleteCashCollection({ variables: { id } });
                refetch();
                Alert.alert('Success', 'Cash collection deleted successfully.');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete cash collection.');
              }
            } else {
              Alert.alert('Action not available offline', 'You need to be online to delete a cash collection.');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
        <Text style={styles.label}>Cash Collection</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Collection for Date</Text>
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
          <View style={[styles.table, { width: width }]}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Date</Text>
              <Text style={styles.tableHeader}>Amount</Text>
              <Text style={styles.tableHeader}>Actions</Text>
            </View>

            {data?.listCashCollections?.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.tableCell}>{item.collected_at}</Text>
                <Text style={styles.tableCell}>{item.amount}</Text>
                <TouchableOpacity style={styles.tableCellCentre} onPress={() => handleDeleteCollection(item.id)}>
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
  label: {
    fontSize: width * 0.015,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  datePickerButton: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: width * 0.02,
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
    fontSize: width * 0.02,
  },
  tableHeaderCenter: {
    fontWeight: 'bold',
    width: width * 0.3,
    textAlign: 'center',
    fontSize: width * 0.02,
  },
  tableCell: {
    width: width * 0.3,
    textAlign: 'left',
  },
  tableCellCentre: {
    width: width * 0.3,
    textAlign: 'center',
  },
});

export default CashCollectionsScreen;
