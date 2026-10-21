import React, {useCallback, useState, useMemo, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Image,
  InteractionManager,
} from 'react-native';
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTourGuideController} from 'rn-tourguide';
import Svg, {Path} from 'react-native-svg';
import {Colors, Spacing, Radius, getRandomOtherMascot} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {hasSeenTour, markTourSeen} from '../../utils/storage';
import dealersData from '../../mock/dealers.json';

interface DealerBranch {
  code: string;
  name: string;
}

const DEALER_LIST: DealerBranch[] = dealersData as DealerBranch[];

export default function DealerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {setIsTabBarHidden} = useTabNav();
  const [search, setSearch] = useState('');
  const mascotSource = useMemo(() => getRandomOtherMascot(), []);
  const {start, stop, canStart, TourGuideZone} = useTourGuideController('dealer');
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const startRef = useRef(start);
  startRef.current = start;
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isFocused || !canStart || hasCheckedRef.current) {
      return;
    }
    hasCheckedRef.current = true;

    if (hasSeenTour('dealer')) {
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) {
        return;
      }
      timer = setTimeout(() => {
        if (isActive && !hasSeenTour('dealer')) {
          startRef.current?.();
          markTourSeen('dealer');
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

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => {
        setIsTabBarHidden(false);
        stopRef.current?.();
      };
    }, [setIsTabBarHidden]),
  );

  const filteredDealers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return DEALER_LIST;
    }
    return DEALER_LIST.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <View style={[styles.topBar, {paddingTop: Math.max(insets.top, 16) + Spacing.xs}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={Colors.textHeadline}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.topBarTitleBox}>
          <Text style={styles.topBarSubtitle}>Panduan Sortir BPKB</Text>
          <Text style={styles.topBarTitle}>List Dealer</Text>
        </View>
        <TouchableOpacity
          style={styles.topBarRightSlot}
          onPress={() => canStart && start()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka Panduan List Dealer">
          <Image
            source={mascotSource}
            style={styles.topBarMascot}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <TourGuideZone
        zone={1}
        text="Gunakan pencarian ini untuk menemukan kode cabang atau nama dealer Honda secara instan."
        borderRadius={16}
        shape="rectangle">
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"
                stroke={Colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kode atau nama dealer..."
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </TourGuideZone>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        {filteredDealers.map((dealer, index) => {
          const card = (
            <View key={dealer.code} style={styles.dealerCard}>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{dealer.code}</Text>
              </View>
              <View style={styles.dealerMeta}>
                <Text style={styles.dealerName}>{dealer.name}</Text>
              </View>
            </View>
          );

          if (index === 0) {
            return (
              <TourGuideZone
                key={dealer.code}
                zone={2}
                text="Setiap kartu menampilkan kode unik cabang dealer untuk menyortir berkas fisik BPKB."
                borderRadius={16}
                shape="rectangle">
                {card}
              </TourGuideZone>
            );
          }

          return card;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarTitleBox: {
    alignItems: 'center',
    flex: 1,
  },
  topBarSubtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  topBarTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.textHeadline,
  },
  topBarRightSlot: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarMascot: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textHeadline,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  dealerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  codePill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  codeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  dealerMeta: {
    flex: 1,
  },
  dealerName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.textHeadline,
  },
});
