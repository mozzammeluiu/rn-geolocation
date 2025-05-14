import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/Chats/AuthScreen';
import ChatListScreen from '../screens/Chats/ChatListScreen';
import ChatScreen from '../screens/Chats/ChatScreen';

const ChatNav = createNativeStackNavigator();
const ChatStack = () => (
  <ChatNav.Navigator>
     <ChatNav.Screen name="Auth" component={AuthScreen} />
    <ChatNav.Screen name="ChatList" component={ChatListScreen}/>
    <ChatNav.Screen name="Chat" component={ChatScreen} />
  </ChatNav.Navigator>
);
export default ChatStack;
