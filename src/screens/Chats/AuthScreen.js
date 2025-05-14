import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
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
  const [isSignUp, setIsSignUp] = useState(false);

  const signUp = async () => {
    if (!username) {
      Alert.alert('Validation', 'Please enter a username');
      return;
    }
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
        text1: 'Account created successfully 👋',
        text2: 'Please Sign in to access your account',
      });
      setIsSignUp(false); // Go to sign-in after sign-up
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

  const handleSubmit = () => {
    if (isSignUp) {
      signUp();
    } else {
      signIn();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

      {isSignUp && (
        <TextInput
          placeholder="Username"
          placeholderTextColor="#000"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#000"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsSignUp(prev => !prev)}
        style={styles.switchMode}
      >
        <Text style={styles.switchText}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002f87',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#002f87',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#002f87',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthScreen;
