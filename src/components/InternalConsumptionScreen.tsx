import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@apollo/client';
import DropdownMenu from '../navigation/DropdownMenu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getInternalConsumptionRecordsQuery, deleteInternalConsumptionMutation } from '../graphql/mutations/internalConsumption';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const InternalConsumptionScreen = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { data, refetch } = useQuery(getInternalConsumptionRecordsQuery);
  const [deleteInternalConsumption] = useMutation(deleteInternalConsumptionMutation);
  const navigation = useNavigation();

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
    const offlineConsumptions = JSON.parse(await AsyncStorage.getItem('offlineConsumptions')) || [];
    for (const consumption of offlineConsumptions) {
      await addInternalConsumption({ variables: consumption });
    }
    await AsyncStorage.removeItem('offlineConsumptions');
    refetch();
  };

  const handleDeleteConsumption = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this consumption record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            if (isOnline) {
              await deleteInternalConsumption({ variables: { id } });
              refetch();
            } else {
              Alert.alert('Action not available offline', 'You need to be online to delete a record.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const refreshConsumptions = async () => {
    try {
      await refetch();
      Alert.alert('Success', 'Consumptions refreshed from server');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh consumption records');
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Date</Text>
      <Text style={styles.headerText}>Name</Text>
      <Text style={styles.headerText}>Product Name</Text>
      <Text style={styles.headerText}>Quantity</Text>
      <Text style={styles.headerText}>Reason</Text>
      <Text style={styles.tableHeaderCenter}><Icon name="tasks" size={20} color="red" /></Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.rowText}>{moment(item.consumed_at).format('ddd D MMMM YYYY\nHH:mm')}</Text>
      <Text style={styles.rowText}>{item.internal_consumption_name}</Text>
      <Text style={styles.rowText}>{item.product_name}</Text>
      <Text style={styles.rowText}>{item.qty}</Text>
      <Text style={styles.rowText}>{item.reason}</Text>
      <TouchableOpacity onPress={() => handleDeleteConsumption(item.id)}>
        <Icon name="trash" size={20} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshConsumptions}>
        <Icon name="refresh" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.active_page}>
        <Text>Internal Consumption Records</Text>
        {renderTableHeader()}
        <FlatList
          data={data?.getInternalConsumptionRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <View style={styles.totals_page}>
        <Button title="Add Consumption" onPress={() => navigation.navigate('AddInternalConsumption')} />
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeaderCenter: {
    fontWeight: 'bold',
    width: width * 0.3,
    flex: 1,
    textAlign: 'right'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
    textAlign: 'left',
  },
  totals_page: {
    position: 'absolute',
    bottom: height * 0.005,
    textAlign: 'right',
    height: height * 0.15,
    right: width * 0.01,
    backgroundColor: 'white',
  },
  active_page: {
    position: 'relative',
    height: height * 0.85,
    overflow: 'scroll',
  },
  menu_page: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.01,
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

export default InternalConsumptionScreen;