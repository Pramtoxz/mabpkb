import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import TextRecognitionScreen from './src/screens/TextRecognitionScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import DocumentScannerScreen from './src/screens/DocumentScannerScreen';

type Screen = 'home' | 'text' | 'barcode' | 'document';

function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const goBack = () => setScreen('home');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {screen === 'home' && (
        <HomeScreen onNavigate={setScreen} />
      )}
      {screen === 'text' && (
        <TextRecognitionScreen onBack={goBack} />
      )}
      {screen === 'barcode' && (
        <BarcodeScannerScreen onBack={goBack} />
      )}
      {screen === 'document' && (
        <DocumentScannerScreen onBack={goBack} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
