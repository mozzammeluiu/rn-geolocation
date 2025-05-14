/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, FlatList, Text, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

function truncateText(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

const emptyLogs = () => (
  <View style={{ alignItems: 'center', marginTop: 50 }}>
    <Text style={{ fontSize: 16, color: '#777' }}>
      No Travel Logs Available. Add one!
    </Text>
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

  return (
    <View style={{flex: 1}}>
      {/* Floating Add Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1,
        }}>
        <Ionicons
          onPress={() => navigation.navigate('NewLog')}
          name="add-circle"
          size={40}
          color="#4CAF50"
        />
      </View>

      {/* Travel Logs List */}
      <FlatList
        contentContainerStyle={{paddingBottom: 100, marginTop: 10}}
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={{
              marginBottom: 20,
              padding: 10,
              borderWidth: 1,
              borderColor: '#d5d5d5',
              borderRadius: 6,
            }}>
            {item.photo && (
              <Image
                source={{uri: `data:image/jpeg;base64,${item.photo}`}}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 5,
                  marginBottom: 10,
                }}
              />
            )}
            <View style={{flexDirection: 'row'}}>
              <Ionicons
                onPress={() => navigation.navigate('NewLog')}
                name="location-sharp"
                size={14}
              />
              <Text style={{marginTop: -3}}>
                {item.location.city ??
                  `Latitude: ${item.location.latitude}, Longitude: ${item.location.longitude}`}
              </Text>
            </View>
            <View>
              <Text>{truncateText(item.notes, 150)}</Text>
            </View>
          </View>
        )}
         ListEmptyComponent={emptyLogs}
      />
    </View>
  );
}
