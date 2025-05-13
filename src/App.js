import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import firebase from '../firebase';
import ChatStack from './stacks/ChatStack';
import HomeStack from './stacks/HomeStack';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;

    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Chat') {
      iconName = focused ? 'chatbubble' : 'chatbubble-outline';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: 'gray',
});

export default function App() {
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase.database().ref(`users/${user.uid}`).set({ online: true });
        firebase.database().ref(`users/${user.uid}`).onDisconnect().set({ online: false });
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Chat" component={ChatStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
