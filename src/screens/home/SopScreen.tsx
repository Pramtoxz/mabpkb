import React, {useCallback, useMemo, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import sopData from '../../mock/sop.json';

interface SopItem {
  step: string;
  title: string;
  description: string;
  check: string;
}

const SOP_STEPS: SopItem[] = sopData as SopItem[];

export default function SopScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {setIsTabBarHidden} = useTabNav();
  const mascotSource = useMemo(() => getRandomOtherMascot(), []);
  const {start, stop, canStart, TourGuideZone} = useTourGuideController('sop');
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

    if (hasSeenTour('sop')) {
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) {
        return;
      }
      timer = setTimeout(() => {
        if (isActive && !hasSeenTour('sop')) {
          startRef.current?.();
          markTourSeen('sop');
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

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent
      />
      <View
        style={[
          styles.topBar,
          {paddingTop: Math.max(insets.top, 16) + Spacing.xs},
        ]}>
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
          <Text style={styles.topBarSubtitle}>Standar Operasional</Text>
          <Text style={styles.topBarTitle}>Panduan SOP Pemindaian</Text>
        </View>
        <TouchableOpacity
          style={styles.topBarRightSlot}
          onPress={() => canStart && start()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka Panduan SOP">
          <Image
            source={mascotSource}
            style={styles.topBarMascot}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        <TourGuideZone
          zone={1}
          text="Panduan setup tripod meja scanner dan pedal kaki agar hasil bidik stabil dan bebas blur."
          borderRadius={20}
          shape="rectangle">
          <View style={styles.bannerCard}>
            <Text style={styles.bannerHeading}>Alur Kerja Tripod & Pedal Kaki</Text>
            <Text style={styles.bannerBody}>
              Pastikan smartphone terpasang kuat pada tripod meja scanner. Letakkan
              lembar BPKB tepat di area bidik kamera dan tekan pedal kaki untuk
              mengambil foto tanpa menyentuh layar.
            </Text>
          </View>
        </TourGuideZone>

        <View style={styles.stepList}>
          {SOP_STEPS.map((item, index) => {
            const card = (
              <View key={item.step} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{item.step}</Text>
                  </View>
                  <View style={styles.stepTitleBox}>
                    <Text style={styles.stepIndexText}>Tahap {index + 1} dari {SOP_STEPS.length}</Text>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                  </View>
                </View>

                <Text style={styles.stepDescription}>{item.description}</Text>

                <View style={styles.checkCard}>
                  <View style={styles.checkIconBox}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke={Colors.primary}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.checkText}>{item.check}</Text>
                </View>
              </View>
            );

            if (index === 0) {
              return (
                <TourGuideZone
                  key={item.step}
                  zone={2}
                  text="Ikuti 5 tahapan standar operasional pemindaian berkas BPKB secara berurutan."
                  borderRadius={18}
                  shape="rectangle">
                  {card}
                </TourGuideZone>
              );
            }

            return card;
          })}
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  bannerCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bannerHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  bannerBody: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textHeadline,
  },
  stepList: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 12,
  },
  stepBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  stepTitleBox: {
    flex: 1,
  },
  stepIndexText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  stepTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textHeadline,
  },
  stepDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  checkIconBox: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.textHeadline,
  },
});
