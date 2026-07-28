import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {ScanProvider} from './src/contexts/ScanContext';
import {AlertProvider} from './src/contexts/AlertContext';
import {AppNavigator} from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#002366" />
      <AlertProvider>
        <ScanProvider>
          <AppNavigator />
        </ScanProvider>
      </AlertProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
