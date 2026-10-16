import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {HomeStackParamList} from './types';
import HomeScreen from '../screens/home/HomeScreen';
import TeamScreen from '../screens/home/TeamScreen';
import DealerScreen from '../screens/home/DealerScreen';
import SopScreen from '../screens/home/SopScreen';
import PedalTestScreen from '../screens/home/PedalTestScreen';

import TrackStatusScreen from '../screens/track/TrackStatusScreen';
import HandoverScreen from '../screens/home/HandoverScreen';
import RevisionScreen from '../screens/home/RevisionScreen';
import PerformanceScreen from '../screens/home/PerformanceScreen';

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
      <Stack.Screen name="TrackStatus" component={TrackStatusScreen} />
      <Stack.Screen name="Handover" component={HandoverScreen} />
      <Stack.Screen name="Revision" component={RevisionScreen} />
      <Stack.Screen name="Performance" component={PerformanceScreen} />
    </Stack.Navigator>
  );
}

