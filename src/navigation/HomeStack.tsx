import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import {Colors, Fonts} from '../constants';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.primary},
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: {fontFamily: Fonts.heading.semiBold, fontSize: 18},
      }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{title: 'MABPKB'}}
      />
    </Stack.Navigator>
  );
}
