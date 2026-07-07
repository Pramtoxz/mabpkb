import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import LiquidGlassTabBar from '../components/LiquidGlassTabBar';
import {HomeIcon, CameraIcon, BatchIcon} from '../components/TabIcons';
import HomeStack from './HomeStack';
import ScanStack from './ScanStack';
import BatchStack from './BatchStack';
import {Colors} from '../constants';

const screens = [
  {key: 'home', component: HomeStack},
  {key: 'scan', component: ScanStack},
  {key: 'batch', component: BatchStack},
] as const;

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs: [
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
  ] = [
    {
      key: 'home',
      icon: <HomeIcon color={Colors.neutral} />,
      iconActive: <HomeIcon color={Colors.primary} />,
      onPress: () => setActiveTab(0),
    },
    {
      key: 'scan',
      icon: <CameraIcon />,
      iconActive: <CameraIcon />,
      onPress: () => setActiveTab(1),
    },
    {
      key: 'batch',
      icon: <BatchIcon color={Colors.neutral} />,
      iconActive: <BatchIcon color={Colors.primary} />,
      onPress: () => setActiveTab(2),
    },
  ];

  const ActiveScreen = screens[activeTab].component;

  return (
    <NavigationContainer>
      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>
      <LiquidGlassTabBar tabs={tabs} activeIndex={activeTab} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
