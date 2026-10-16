import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {getActivity, type ActivityResponse} from '../../api/endpoints';
import HomeHeader from './components/HomeHeader';
import ShiftProductivityCard from './components/ShiftProductivityCard';
import QuickActionRibbon from './components/QuickActionRibbon';
import HeroScannerCard from './components/HeroScannerCard';
import mockActivity from '../../mock/activity.json';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {setActiveTab, setIsTabBarHidden} = useTabNav();

  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity();
      setActivity(data);
    } catch {
      setActivity(mockActivity);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(false);
      fetchActivity();
    }, [fetchActivity, setIsTabBarHidden]),
  );

  useEffect(() => {
    setIsTabBarHidden(false);
    fetchActivity();
  }, [fetchActivity, setIsTabBarHidden]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivity();
    setRefreshing(false);
  }, [fetchActivity]);

  const handleStartScan = useCallback(() => {
    setActiveTab(1);
  }, [setActiveTab]);

  const target = activity?.target_bpkb ?? 100;
  const completed = activity?.completed_bpkb ?? 78;

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: 96 + Math.max(insets.bottom, 12),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }>
        <HomeHeader />

        <ShiftProductivityCard completed={completed} target={target} />

        <QuickActionRibbon
          onOpenTeam={() => navigation.navigate('TeamDetail')}
          onOpenDealer={() => navigation.navigate('DealerList')}
          onOpenSop={() => navigation.navigate('SopGuide')}
          onOpenPedalTest={() => navigation.navigate('PedalTest')}
        />

        <HeroScannerCard onPressScan={handleStartScan} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});