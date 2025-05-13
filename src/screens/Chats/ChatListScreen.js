/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TextInput, TouchableOpacity} from 'react-native';
import firebase from '../../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('users')
      .onSnapshot(async snapshot => {
        const userList = [];
        for (const doc of snapshot.docs) {
          const userData = doc.data();
          const status = await firebase
            .database()
            .ref(`users/${doc.id}`)
            .once('value');
          userList.push({
            id: doc.id,
            ...userData,
            online: status.val()?.online || false,
          });
        }
        setUsers(
          userList.filter(user => user.id !== firebase.auth().currentUser.uid),
        );
      });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{padding: 20}}>
      <View style={{flexDirection: 'row'}}>
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={{borderWidth: 1, marginBottom: 10, padding: 10, flex: 1}}
        />
        <Ionicons
          onPress={() =>  navigation.navigate('Chat')}
          name="person-add"
          size={34}
          style={{
            alignSelf: 'center',
            marginTop: -10,
            marginLeft: 10,
          }}
        />
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Chat', {
                userId: item.id,
                username: item.username,
              })
            }>
            <View
              style={{padding: 10, flexDirection: 'row', alignItems: 'center'}}>
              <Text>{item.username}</Text>
              <Text
                style={{marginLeft: 10, color: item.online ? 'green' : 'red'}}>
                {item.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ChatListScreen;
