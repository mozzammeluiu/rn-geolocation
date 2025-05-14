/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import MapView, {Marker} from 'react-native-maps';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import Toast from 'react-native-toast-message';

const AppButton = ({title, onPress, style}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const TravelLogFeature = ({navigation}) => {
  const [logs, setLogs] = useState([]);
  const [location, setLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState('feed');

  useEffect(() => {
    loadLogs();
  }, []);

  const saveLogs = async newLogs => {
    try {
      await AsyncStorage.setItem('travelLogs', JSON.stringify(newLogs));
    } catch (error) {
      Alert.alert('Error', 'Failed to save logs');
    }
  };

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('travelLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load logs');
    }
  };

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      return true;
    }

    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setManualLocation('');
      },
      error => {
        Alert.alert('Error', `Failed to get location: ${error.message}`);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const requestMediaPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Yeamazing Needs your camera permission',
        buttonNeutral: 'Ask me later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Ok',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickPhoto = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery access is required');
      return;
    }

    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', includeBase64: true},
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else {
          setPhoto(response.assets[0].base64);
        }
      },
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required');
      return;
    }

    ImagePicker.launchCamera(
      {mediaType: 'photo', includeBase64: true},
      response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else {
          setPhoto(response.assets[0].base64);
        }
      },
    );
  };

  const saveLog = () => {
    if (!location && !manualLocation) {
      Alert.alert('Error', 'Please provide a location');
      return;
    }
    if (!notes) {
      Alert.alert('Error', 'Please add some notes');
      return;
    }

    const newLog = {
      id: uuidv4(),
      location: location || {city: manualLocation},
      photo: photo || null,
      notes,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    setLocation(null);
    setManualLocation('');
    setPhoto(null);
    setNotes('');
    Toast.show({
      type: 'success',
      text1: 'Your log created successfully 👋',
    });
    navigation.navigate('Home');
  };

  const renderFeedView = () => (
    <View style={styles.feedContainer}>
      {logs.map(log => (
        <View key={log.id} style={styles.logCard}>
          {log.photo && (
            <Image
              source={{uri: `data:image/jpeg;base64,${log.photo}`}}
              style={styles.logImage}
            />
          )}
          <Text style={styles.logLocation}>
            {log.location.latitude
              ? `Lat: ${log.location.latitude}, Lon: ${log.location.longitude}`
              : log.location.city}
          </Text>
          <Text style={styles.logNotes}>{log.notes}</Text>
          <Text style={styles.logTimestamp}>
            {new Date(log.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderMapView = () => (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location?.latitude || 37.78825,
        longitude: location?.longitude || -122.4324,
        latitudeDelta: 10,
        longitudeDelta: 10,
      }}>
      {logs
        .filter(log => log.location.latitude)
        .map(log => (
          <Marker
            key={log.id}
            coordinate={{
              latitude: log.location.latitude,
              longitude: log.location.longitude,
            }}
            title={log.notes}
            description={new Date(log.timestamp).toLocaleString()}
          />
        ))}
    </MapView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Location</Text>
        <AppButton title="Get GPS Location" onPress={getLocation} />
        {location && (
          <Text style={styles.gpsText}>
            Lat: {location.latitude}, Lon: {location.longitude}
          </Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Or enter city manually"
          value={manualLocation}
          onChangeText={setManualLocation}
        />

        <Text style={styles.label}>Photo</Text>
        <View style={styles.photoButtons}>
          <AppButton
            title="Pick from Gallery"
            onPress={pickPhoto}
            style={{flex: 1, marginRight: 5}}
          />
          <AppButton
            title="Take Photo"
            onPress={takePhoto}
            style={{flex: 1, marginLeft: 5}}
          />
        </View>
        {photo && (
          <Image
            source={{uri: `data:image/jpeg;base64,${photo}`}}
            style={styles.previewImage}
          />
        )}

        <Text style={styles.label}>Journal Notes</Text>
        <TextInput
          style={[styles.input, {height: 100}]}
          placeholder="Write your travel notes..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <AppButton title="Save Log" onPress={saveLog} />
      </View>

      <View style={styles.toggleButtons}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'feed' && styles.activeButton,
          ]}
          onPress={() => setViewMode('feed')}>
          <Text style={[styles.toggleButtonText, viewMode === 'feed'  && {color:'#fff'}]}>Feed View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'map' && styles.activeButton,
          ]}
          onPress={() => setViewMode('map')}>
          <Text style={[styles.toggleButtonText,viewMode === 'map'  && {color:'#fff'}]}>Map View</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'feed' ? renderFeedView() : renderMapView()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  gpsText: {
    marginVertical: 6,
    color: '#333',
  },
  photoButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#002f87',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#002f87',
    marginHorizontal: 5,
  },
  toggleButtonText: {
    color: '#002f87',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#002f87',
  },
  feedContainer: {
    flex: 1,
  },
  logCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  logImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  logLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logNotes: {
    fontSize: 14,
    marginBottom: 5,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  map: {
    flex: 1,
    height: 300,
    borderRadius: 12,
  },
});

export default TravelLogFeature;
