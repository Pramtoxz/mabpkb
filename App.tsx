import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ScanProvider } from './src/contexts/ScanContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { AppNavigator } from './src/navigation';
import PermissionScreen from './src/screens/PermissionScreen';

export default function App() {
  const [permissionsReady, setPermissionsReady] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#002366" />
      <AlertProvider>
        {!permissionsReady ? (
          <PermissionScreen onAllGranted={() => setPermissionsReady(true)} />
        ) : (
          <ScanProvider>
            <AppNavigator />
          </ScanProvider>
        )}
      </AlertProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
