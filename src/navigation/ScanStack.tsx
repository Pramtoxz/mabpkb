import React, {useEffect} from 'react';
import {BackHandler} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {ScanStackParamList} from './types';
import {useTabNav} from '../contexts/TabNavContext';
import {PedalProvider} from '../contexts/PedalContext';
import ScanStep1Screen from '../screens/scan/ScanStep1Screen';
import ScanStep2Screen from '../screens/scan/ScanStep2Screen';
import ScanStep3Screen from '../screens/scan/ScanStep3Screen';
import ScanStep4Screen from '../screens/scan/ScanStep4Screen';
import ScanStep5Screen from '../screens/scan/ScanStep5Screen';
import ScanReviewScreen from '../screens/scan/ScanReviewScreen';

const Stack = createNativeStackNavigator<ScanStackParamList>();

function ScanStep1Wrapper(props: any) {
  const {setActiveTab} = useTabNav();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setActiveTab(0);
      return true;
    });
    return () => sub.remove();
  }, [setActiveTab]);

  return <ScanStep1Screen {...props} />;
}

export default function ScanStack() {
  return (
    <PedalProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="ScanStep1" component={ScanStep1Wrapper} />
        <Stack.Screen name="ScanStep2" component={ScanStep2Screen} />
        <Stack.Screen name="ScanStep3" component={ScanStep3Screen} />
        <Stack.Screen name="ScanStep4" component={ScanStep4Screen} />
        <Stack.Screen name="ScanStep5" component={ScanStep5Screen} />
        <Stack.Screen name="ScanReview" component={ScanReviewScreen} />
      </Stack.Navigator>
    </PedalProvider>
  );
}