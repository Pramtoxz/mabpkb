import React, {useState, useRef, useEffect, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {TabNavProvider, useTabNav} from '../contexts/TabNavContext';
import HomeStack from './HomeStack';
import ScanStack from './ScanStack';
import BatchStack from './BatchStack';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import BluetoothPedalModal from '../components/BluetoothPedalModal';
import {usePedalStatus} from '../hooks/usePedalStatus';
import {useHardwareKey} from '../hooks/useHardwareKey';
import {Colors} from '../constants';

const screens = [
  {key: 'home', component: HomeStack},
  {key: 'scan', component: ScanStack},
  {key: 'batch', component: BatchStack},
] as const;

function NavigatorContent() {
  const {
    activeTab,
    setActiveTab,
    showWelcome,
    isPedalIntercepted,
  } = useTabNav();

  const {isConnected} = usePedalStatus();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'connected' | 'pedal_pressed'>('connected');
  const prevConnectedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevConnectedRef.current === null) {
      prevConnectedRef.current = isConnected;
      return;
    }
    if (prevConnectedRef.current === false && isConnected === true) {
      setModalType('connected');
      setModalVisible(true);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const handlePedalOutside = useCallback(() => {
    setModalType('pedal_pressed');
    setModalVisible(true);
  }, []);

  useHardwareKey(
    handlePedalOutside,
    activeTab !== 1 && !isPedalIntercepted,
    'volumeDown',
  );

  const ActiveScreen = screens[activeTab].component;

  return (
    <View style={styles.screenContainer}>
      {showWelcome ? <WelcomeScreen /> : <ActiveScreen />}
      <BluetoothPedalModal
        visible={modalVisible}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavProvider>
        <NavigatorContent />
      </TabNavProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
