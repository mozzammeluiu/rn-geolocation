/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLogs();
    });
    return unsubscribe;
  }, [navigation]);

  const loadLogs = async () => {
    const data = await AsyncStorage.getItem('logs');
    if (data){
        setLogs(JSON.parse(data));
    }
  };

  return (
    <View>
      <Button title="Add Log" onPress={() => navigation.navigate('NewLog')} />
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {item.photo && <Image source={{ uri: item.photo }} style={{ width: 100, height: 100 }} />}
            <Text>{item.location}</Text>
            <Text>{item.notes}</Text>
          </View>
        )}
      />
    </View>
  );
}
