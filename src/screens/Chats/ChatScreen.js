/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import firebase from '../../../firebase';

const ChatScreen = ({ navigation, route }) => {
  const { userId, username } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const currentUser = firebase.auth().currentUser;

  const chatId = [currentUser.uid, userId].sort().join('_');
  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        const messageList = snapshot?.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageList);
      });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (text.trim()) {
     await firebase
        .firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          text,
          senderId: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      setText('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Chat with {username}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginVertical: 5,
              backgroundColor: item.senderId === currentUser.uid ? '#DCF8C6' : '#ECECEC',
              alignSelf: item.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
              borderRadius: 10,
            }}
          >
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={{ flex: 1, borderWidth: 1, padding: 10, marginRight: 10 }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;
