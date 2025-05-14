/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await firebase.auth().signOut();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} style={styles.icon} />
        </TouchableOpacity>
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
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.username}>{item.username}</Text>
                <Text
                  style={[
                    styles.status,
                    {color: item.online ? 'green' : 'red'},
                  ]}>
                  {item.online ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  icon: {
    marginLeft: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#d5d5d5',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChatListScreen;
