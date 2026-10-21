import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  InteractionManager,
} from 'react-native';
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTourGuideController, TourGuideZone} from 'rn-tourguide';
import {Colors} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {getActivity, type ActivityResponse} from '../../api/endpoints';
import {getCachedActivity, saveActivity, hasSeenTour} from '../../utils/storage';
import HomeHeader from './components/HomeHeader';
import ShiftProductivityCard from './components/ShiftProductivityCard';
import QuickActionRibbon from './components/QuickActionRibbon';
import HeroScannerCard from './components/HeroScannerCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const hasCheckedTourRef = useRef(false);
  const {start, stop, canStart} = useTourGuideController();
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const startRef = useRef(start);
  startRef.current = start;
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

  const [activity, setActivity] = useState<ActivityResponse>(() => getCachedActivity());

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity();
      if (data) {
        setActivity(data);
        saveActivity(data);
      }
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(false);
      fetchActivity();
      return () => {
        stopRef.current?.();
      };
    }, [fetchActivity, setIsTabBarHidden]),
  );

  useEffect(() => {
    if (!isFocused || !canStart || hasCheckedTourRef.current) {
      return;
    }
    hasCheckedTourRef.current = true;

    if (hasSeenTour('home')) {
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) {
        return;
      }
      timer = setTimeout(() => {
        if (isActive && !hasSeenTour('home')) {
          startRef.current?.();
        }
      }, 500);
    });

    return () => {
      isActive = false;
      task.cancel();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [canStart, isFocused]);

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
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 10),
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <TourGuideZone
        zone={1}
        text="Ketuk avatar maskot ACIAX ini kapan saja untuk membuka panduan alur kerja sistem."
        borderRadius={20}
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
          onOpenSop={() => navigation.navigate('SopGuide')}
          onOpenPedalTest={() => navigation.navigate('PedalTest')}
          onOpenTeam={() => navigation.navigate('TeamDetail')}
        />
      </TourGuideZone>

      <View style={styles.heroContainer}>
        <TourGuideZone
          zone={4}
          text="Stasiun pemindai BPKB. Pantau kesiapan koneksi pedal kaki Bluetooth dan mulai scan berkas."
          borderRadius={24}
          style={styles.heroTourZone}
          shape="rectangle">
          <HeroScannerCard onPressScan={handleStartScan} />
        </TourGuideZone>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroContainer: {
    flex: 1,
  },
  heroTourZone: {
    flex: 1,
  },
});