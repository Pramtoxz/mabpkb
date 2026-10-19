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
import {useTourGuideController, TourGuideZone} from 'rn-tourguide';
import {Colors, Spacing} from '../../constants';
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
  const {start, canStart} = useTourGuideController();
  const {
    setActiveTab,
    setIsTabBarHidden,
    pendingTrackId,
    setPendingTrackId,
  } = useTabNav();

  useEffect(() => {
    if (pendingTrackId) {
      navigation.navigate('TrackStatus', {trackId: pendingTrackId});
      setPendingTrackId(null);
    }
  }, [pendingTrackId, navigation, setPendingTrackId]);

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

  const handleMascotPress = useCallback(() => {
    if (canStart) {
      start();
    }
  }, [canStart, start]);

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
            paddingBottom: Spacing.xl + Math.max(insets.bottom, 16),
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
        <TourGuideZone
          zone={1}
          text="Ketuk avatar maskot ACIAX ini kapan saja untuk membuka panduan alur kerja sistem."
          borderRadius={24}
          shape="rectangle">
          <HomeHeader onPressMascot={handleMascotPress} />
        </TourGuideZone>

        <TourGuideZone
          zone={2}
          text="Pantau target harian dan produktivitas pemindaian BPKB Anda secara real-time."
          borderRadius={16}
          shape="rectangle">
          <ShiftProductivityCard completed={completed} target={target} />
        </TourGuideZone>

        <TourGuideZone
          zone={3}
          text="Menu aksi cepat: Daftar Dealer, riwayat BPKB, serah terima, SOP panduan, dan tes pedal kaki."
          borderRadius={16}
          shape="rectangle">
          <QuickActionRibbon
            onOpenDealer={() => navigation.navigate('DealerList')}
            onOpenTrack={() => navigation.navigate('TrackStatus')}
            onOpenHandover={() => navigation.navigate('Handover')}
            onOpenRevision={() => navigation.navigate('Revision')}
            onOpenPerformance={() => navigation.navigate('Performance')}
            onOpenSop={() => {
              if (canStart) {
                start();
              } else {
                navigation.navigate('SopGuide');
              }
            }}
            onOpenPedalTest={() => navigation.navigate('PedalTest')}
            onOpenTeam={() => navigation.navigate('TeamDetail')}
          />
        </TourGuideZone>

        <TourGuideZone
          zone={4}
          text="Stasiun pemindai BPKB. Pantau kesiapan koneksi pedal kaki Bluetooth dan mulai scan berkas."
          borderRadius={16}
          shape="rectangle">
          <HeroScannerCard onPressScan={handleStartScan} />
        </TourGuideZone>
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