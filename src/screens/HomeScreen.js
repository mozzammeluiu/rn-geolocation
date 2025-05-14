/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

function truncateText(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

const emptyLogs = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="document-text-outline" size={60} color="#bbb" />
    <Text style={styles.emptyText}>No Travel Logs Available. Add one!</Text>
  </View>
);

export default function HomeScreen({navigation}) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLogs();
    });
    return unsubscribe;
  }, [navigation]);

  const loadLogs = async () => {
    const data = await AsyncStorage.getItem('travelLogs');
    if (data) {
      setLogs(JSON.parse(data));
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      {item.photo && (
        <Image
          source={{uri: `data:image/jpeg;base64,${item.photo}`}}
          style={styles.image}
        />
      )}
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color="#f25022" />
        <Text style={styles.locationText}>
          {item.location.city ??
            `Latitude: ${item.location.latitude}, Longitude: ${item.location.longitude}`}
        </Text>
      </View>
      <Text style={styles.notesText}>{truncateText(item.notes, 200)}</Text>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#f4f6fb'}}>
      <FlatList
        contentContainerStyle={{padding: 16, paddingBottom: 100}}
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyLogs}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewLog')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '500',
  },
  notesText: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#002f87',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
});
