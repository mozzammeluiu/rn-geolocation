/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import firebase from '../../../firebase';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const signUp = async () => {
    try {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await firebase.firestore().collection('users').doc(user.uid).set({
        username,
        email,
      });
      await firebase.database().ref(`users/${user.uid}`).set({ online: true });
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const signIn = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      await firebase.database().ref(`users/${firebase.auth().currentUser.uid}`).set({ online: true });
      navigation.navigate('ChatList');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Sign Up" onPress={signUp} />
      <View style={{marginTop: 10}}/>
      <Button title="Sign In" onPress={signIn} />
    </View>
  );
};

export default AuthScreen;
