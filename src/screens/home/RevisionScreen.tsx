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
import revisionsData from '../../mock/revisions.json';

interface RevisionItem {
  id: string;
  bpkbNumber: string;
  ownerName: string;
  vehiclePlate: string;
  dealerName: string;
  issue: string;
  status: string;
  timestamp: string;
}

const REVISION_LIST: RevisionItem[] = revisionsData as RevisionItem[];

export default function RevisionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {setIsTabBarHidden} = useTabNav();
  const mascotSource = useMemo(() => getRandomOtherMascot(), []);
  const {start, stop, canStart, TourGuideZone} = useTourGuideController('revision');
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

    if (hasSeenTour('revision')) {
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) {
        return;
      }
      timer = setTimeout(() => {
        if (isActive && !hasSeenTour('revision')) {
          startRef.current?.();
          markTourSeen('revision');
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
          <Text style={styles.topBarSubtitle}>Kendali Mutu Samsat</Text>
          <Text style={styles.topBarTitle}>Berkas Revisi</Text>
        </View>
        <TouchableOpacity
          style={styles.topBarRightSlot}
          onPress={() => canStart && start()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka Panduan Berkas Revisi">
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
          text="Total berkas BPKB yang belum memenuhi standar verifikasi Samsat dan butuh penanganan segera."
          borderRadius={20}
          shape="rectangle">
          <View style={styles.summaryCard}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>{REVISION_LIST.length}</Text>
            </View>
            <View style={styles.summaryMeta}>
              <Text style={styles.summaryTitle}>Berkas Butuh Tindakan</Text>
              <Text style={styles.summarySub}>
                Pisahkan fisik berkas berikut dari tumpukan dealer sebelum jam 16:00.
              </Text>
            </View>
          </View>
        </TourGuideZone>

        <View style={styles.list}>
          {REVISION_LIST.map((item, index) => {
            const cardContent = (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.bpkbNumber}>{item.bpkbNumber}</Text>
                    <Text style={styles.ownerText}>{item.ownerName} • {item.vehiclePlate}</Text>
                  </View>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>{item.timestamp}</Text>
                  </View>
                </View>

                <Text style={styles.dealerText}>{item.dealerName}</Text>

                <View style={styles.issueBox}>
                  <View style={styles.issueIconBox}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        stroke={Colors.primary}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.issueText}>{item.issue}</Text>
                </View>

                {index === 0 ? (
                  <TourGuideZone
                    zone={3}
                    text="Ketuk untuk langsung membuka kamera pemindaian ulang bagi berkas yang buram atau tidak presisi."
                    borderRadius={12}
                    shape="rectangle">
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      activeOpacity={0.85}>
                      <Text style={styles.retakeBtnText}>Foto Ulang Berkas Ini</Text>
                    </TouchableOpacity>
                  </TourGuideZone>
                ) : (
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    activeOpacity={0.85}>
                    <Text style={styles.retakeBtnText}>Foto Ulang Berkas Ini</Text>
                  </TouchableOpacity>
                )}
              </View>
            );

            if (index === 0) {
              return (
                <TourGuideZone
                  key={item.id}
                  zone={2}
                  text="Identitas BPKB bermasalah, mencakup nomor registrasi, nomor polisi, nama dealer, dan catatan kendala verifikasi."
                  borderRadius={20}
                  shape="rectangle">
                  {cardContent}
                </TourGuideZone>
              );
            }

            return cardContent;
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
    gap: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  summaryBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  summaryMeta: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.textHeadline,
  },
  summarySub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bpkbNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textHeadline,
  },
  ownerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.md,
  },
  timeBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10.5,
    color: Colors.textTertiary,
  },
  dealerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    color: Colors.primary,
  },
  issueBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 8,
  },
  issueIconBox: {
    marginTop: 2,
  },
  issueText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  retakeBtn: {
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  retakeBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: Colors.white,
  },
});
