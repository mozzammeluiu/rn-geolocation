import HomeScreen from '../screens/HomeScreen';
import TravelLogFeatureScreen from '../screens/TravelLogFeatureScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const HomeNav = createNativeStackNavigator();
const HomeStack = () => (
  <HomeNav.Navigator initialRouteName="Home">
    <HomeNav.Screen name="Home" component={HomeScreen} />
    <HomeNav.Screen name="NewLog" component={TravelLogFeatureScreen} />
  </HomeNav.Navigator>
);
export default HomeStack;
