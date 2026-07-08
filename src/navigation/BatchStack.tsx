import React, {useEffect} from 'react';
import {BackHandler} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {BatchStackParamList} from './types';
import {useTabNav} from '../contexts/TabNavContext';
import TrackStatusScreen from '../screens/track/TrackStatusScreen';

const Stack = createNativeStackNavigator<BatchStackParamList>();

function TrackStatusWrapper(props: any) {
  const {setActiveTab} = useTabNav();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setActiveTab(0);
      return true;
    });
    return () => sub.remove();
  }, [setActiveTab]);

  return <TrackStatusScreen {...props} />;
}

export default function BatchStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="TrackStatus"
        component={TrackStatusWrapper}
      />
    </Stack.Navigator>
  );
}
