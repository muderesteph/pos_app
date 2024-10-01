
import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions, FlatList, Alert, Linking, 
  } from 'react-native';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import VersionCheck from 'react-native-version-check';
import {GET_LATEST_VERSION} from '../graphql/mutations/about';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropdownMenu from '../navigation/DropdownMenu';


const { width, height } = Dimensions.get('window');

const AboutScreen = () => {
  const { loading, error, data,refetch } = useQuery(GET_LATEST_VERSION);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(VersionCheck.getCurrentVersion());

  useEffect(() => {
    if (data && data.latestVersion) {
      const { version: latestVersion, download_url: downloadUrl } = data.latestVersion;
      checkForUpdate(latestVersion, downloadUrl);
    }
  }, [data]);

  const checkForUpdate = (latestVersion, downloadUrl) => {
    if (VersionCheck.needUpdate({ currentVersion, latestVersion }).isNeeded) {
      showUpdatePopup(downloadUrl);
    }
  };

  const showUpdatePopup = (url) => {
    Alert.alert(
      'New Update Available',
      'A new version of the app is available. Would you like to download it?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => Linking.openURL(url) },
      ]
    );
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error fetching version info</Text>;

  return (
    <View style={styles.container}>
     <View style={styles.text_centred}>
     <Text>Copyright Crown Given technonogies Trading as Mudere General dealers</Text>
      <Text >Current App Version: {currentVersion}</Text>
      {data && (
        <>
          <Text>Latest Version: {data.latestVersion.version}</Text>
          <Button
            title="Download Latest Version"
            onPress={() => Linking.openURL(data.latestVersion.download_url)}
          />
        </>
      )}
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
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 8,
      backgroundColor: '#f0f0f0',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#d0d0d0',
    },
    headerText: {
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    tableHeaderCenter:{
      fontWeight: 'bold',
      width: width * 0.3,
      flex: 1,
      textAlign: 'right',
    },
    container: {
      flex: 1,
      padding: 20,
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
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    toggleButton: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      backgroundColor: '#eee',
    },
    text_centred:{
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: '#eee',
    },
    stockTakeList: {
      marginTop: 20,
      fontSize: width * 0.018
    },
    stockTakeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    itemText: {
      flex: 1,
      textAlign: 'left',
      fontSize: width * 0.018, // Responsive font size
    },
    datePickerButton: {
      marginBottom: 12,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
      alignItems: 'center',
    },
    datePickerText: {
      fontSize: width * 0.04, // Responsive font size
      color: '#333',
    },
    removeItem: {
      color: 'red',
      fontSize: width * 0.05, // Responsive icon size
    },
  });

export default AboutScreen;
