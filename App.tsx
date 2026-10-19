import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {Toaster} from 'sonner-native';
import {TourGuideProvider} from 'rn-tourguide';
import {ScanProvider} from './src/contexts/ScanContext';
import {AlertProvider} from './src/contexts/AlertContext';
import {AppNavigator} from './src/navigation';
import TourTooltip from './src/components/TourTooltip';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <TourGuideProvider
          androidStatusBarVisible={true}
          backdropColor="rgba(32, 35, 45, 0.72)"
          borderRadius={16}
          tooltipComponent={TourTooltip}>
          <StatusBar barStyle="light-content" backgroundColor="#002366" />
          <AlertProvider>
            <ScanProvider>
              <AppNavigator />
            </ScanProvider>
          </AlertProvider>
          <Toast />
          <Toaster />
        </TourGuideProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

