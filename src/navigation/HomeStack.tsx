import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}
