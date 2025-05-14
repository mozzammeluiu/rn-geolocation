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

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Chat', {
          userId: item.id,
          username: item.username,
        })
      }>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: item.online ? '#34C759' : '#ccc'},
            ]}
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={[styles.statusText, {color: item.online ? '#34C759' : '#999'}]}>
            {item.online ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#bbb" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: '#002f87',
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dde3f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  avatarText: {
    fontSize: 18,
    color: '#002f87',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cardContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default ChatListScreen;
