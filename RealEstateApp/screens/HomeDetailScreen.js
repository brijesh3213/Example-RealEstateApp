import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Alert, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
const haversine = require('haversine')
import * as Notifications from 'expo-notifications';
import { requestPermissions } from '../Helper/notificationService'; 


const HomeDetailScreen = ({ route }) => {
  const { home } = route.params;
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const checkLocationPermission = async () => {
      setError(null); 

      try {
        await requestPermissions(); 
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied.');
          return;
        }
        // Retrieve the current location
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCurrentLocation(location.coords);

        // Calculate distance between current location and home location
        const start = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
        const end = {
          latitude: home.latitude,
          longitude: home.longitude
        }
       
if(haversine(start, end) <= 30){
  setIsWithinRange(true);
  await sendNotification('Admin', 'User has reached the home vicinity.');
}else{
  setIsWithinRange(false);
}
       

      } catch (error) {
        setError(error.message);
        Alert.alert('Error', `Failed to retrieve location: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkLocationPermission();
  }, [home.latitude, home.longitude]);


  const unlockHome = async () => {
    Alert.alert('Success', 'Home unlocked successfully!');
  //    -------here you can implete api to hit unlock home -----

   /*  try {
      const response = await axios.post('/mock/unlockHome', { homeId: home.id });
      if (response.status === 200) {
       await sendNotification('User', 'Home has been unlocked.');
        Alert.alert('Success', 'Home unlocked successfully!');
      } else {
        throw new Error('Unlock failed');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to unlock the home: ${error.message}`);
    } */

  };

  const sendNotification = async (recipient, message) => {
    // Implement your notification sending logic here
    // For example, using Expo's notification API
    await Notifications.scheduleNotificationAsync({
      content: {
        title: recipient,
        body: message,
      },
      trigger: null,
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image source={{ uri: home.image }} style={styles.image} />
        <Text style={styles.address}>{home.address}</Text>
        <Text style={styles.description}>{home.description}</Text>
       
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          isWithinRange ? (
            <View>
            <Text style={styles.propertyDetails}>Latitude: {home.latitude}</Text>
            <Text style={styles.propertyDetails}>Longitude: {home.longitude}</Text>
            {currentLocation && (
              <Text style={styles.propertyDetails}>
                Your Location: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
              </Text>
            )}
            <Button title="Unlock Home" onPress={unlockHome} />
            </View>
          ) : (
            <Text style={styles.errorText}>You are not within range to unlock this home.</Text>
          )
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  address: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  propertyDetails: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeDetailScreen;
