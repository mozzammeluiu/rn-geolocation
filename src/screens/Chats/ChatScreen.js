/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
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
  const flatListRef = useRef(null);
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
      keyboardVerticalOffset={90}>
      <Text style={styles.header}>Chat with {username}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === currentUser.uid
                ? styles.myMessage
                : styles.theirMessage,
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#999"
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
    backgroundColor: '#f1f3f6',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  messagesList: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    marginVertical: 6,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#002f87',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#002f87',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ChatScreen;
