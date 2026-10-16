import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import HomeScreen from '../screens/home/HomeScreen';
import TeamScreen from '../screens/home/TeamScreen';
import DealerScreen from '../screens/home/DealerScreen';
import SopScreen from '../screens/home/SopScreen';
import PedalTestScreen from '../screens/home/PedalTestScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen name="TeamDetail" component={TeamScreen} />
      <Stack.Screen name="DealerList" component={DealerScreen} />
      <Stack.Screen name="SopGuide" component={SopScreen} />
      <Stack.Screen name="PedalTest" component={PedalTestScreen} />
    </Stack.Navigator>
  );
}

