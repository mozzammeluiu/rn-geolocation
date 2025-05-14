/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>Chat with {username}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    maxWidth: '75%',
    borderRadius: 12,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#002f87',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
