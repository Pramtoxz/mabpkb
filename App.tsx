import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ScanProvider} from './src/contexts/ScanContext';
import {AppNavigator} from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#002366" />
      <ScanProvider>
        <AppNavigator />
      </ScanProvider>
    </SafeAreaProvider>
  );
}
