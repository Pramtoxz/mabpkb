import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {Toaster} from 'sonner-native';
import {ScanProvider} from './src/contexts/ScanContext';
import {AlertProvider} from './src/contexts/AlertContext';
import {AppNavigator} from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#002366" />
        <AlertProvider>
          <ScanProvider>
            <AppNavigator />
          </ScanProvider>
        </AlertProvider>
        <Toast />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
