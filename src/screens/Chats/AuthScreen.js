/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import firebase from '../../../firebase';
import Toast from 'react-native-toast-message';

const AuthScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      const {user} = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      await firebase.firestore().collection('users').doc(user.uid).set({
        username,
        email,
      });
      await firebase.database().ref(`users/${user.uid}`).set({online: true});
      setPassword('');
      Toast.show({
        type: 'success',
        text1: 'Your account created successfully 👋',
        text2: 'Please Sign in to access your account',
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      await firebase
        .database()
        .ref(`users/${firebase.auth().currentUser.uid}`)
        .set({online: true});
      setEmail('');
      setPassword('');
      setUsername('');
      navigation.navigate('ChatList');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{borderWidth: 1, marginBottom: 10, padding: 10}}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{borderWidth: 1, marginBottom: 10, padding: 10}}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{borderWidth: 1, marginBottom: 10, padding: 10}}
      />
      <Button title="Sign Up" onPress={signUp} color="#002f87"/>
      <View style={{marginTop: 10}} />
      <Button title="Sign In" onPress={signIn} color="#002f87"/>

      {/* Full-screen Loader */}
      <Modal transparent={true} animationType="none" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f25022" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthScreen;
