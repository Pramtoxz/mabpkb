import React from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import LiquidGlassTabBar from '../components/LiquidGlassTabBar';
import {HomeIcon, CameraIcon, BatchIcon} from '../components/TabIcons';
import {TabNavProvider, useTabNav} from '../contexts/TabNavContext';
import HomeStack from './HomeStack';
import ScanStack from './ScanStack';
import BatchStack from './BatchStack';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import {Colors} from '../constants';

const screens = [
  {key: 'home', component: HomeStack},
  {key: 'scan', component: ScanStack},
  {key: 'batch', component: BatchStack},
] as const;

const tabsConfig = [
  {key: 'home', Icon: HomeIcon, tab: 0},
  {key: 'scan', Icon: CameraIcon, tab: 1},
  {key: 'batch', Icon: BatchIcon, tab: 2},
] as const;

function NavigatorContent() {
  const {activeTab, setActiveTab, isTabBarHidden, showWelcome} = useTabNav();

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  const tabs = tabsConfig.map(t => ({
    key: t.key,
    icon: <t.Icon color={t.key === 'scan' ? undefined : Colors.textSecondary} />,
    iconActive: <t.Icon color={t.key === 'scan' ? undefined : Colors.textOnAccent} />,
    onPress: () => setActiveTab(t.tab),
  })) as [
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
    {key: string; icon: React.ReactNode; iconActive: React.ReactNode; onPress: () => void},
  ];

  const ActiveScreen = screens[activeTab].component;
  const isHidden = activeTab === 1 || isTabBarHidden;

  return (
    <>
      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>
      <LiquidGlassTabBar tabs={tabs} activeIndex={activeTab} hidden={isHidden} />
    </>
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
