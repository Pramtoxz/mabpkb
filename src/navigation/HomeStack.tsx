import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
}
