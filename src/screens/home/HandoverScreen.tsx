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
import handoverData from '../../mock/handover.json';

interface HandoverItem {
  id: string;
  dealerCode: string;
  dealerName: string;
  documentCount: number;
  timestamp: string;
  status: string;
  suratNumber: string;
  hasSignedPhoto: boolean;
  notes: string;
}

const HANDOVER_LIST: HandoverItem[] = handoverData as HandoverItem[];

export default function HandoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {setIsTabBarHidden} = useTabNav();
  const mascotSource = useMemo(() => getRandomOtherMascot(), []);
  const {start, stop, canStart, TourGuideZone} = useTourGuideController('handover');
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

    if (hasSeenTour('handover')) {
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) {
        return;
      }
      timer = setTimeout(() => {
        if (isActive && !hasSeenTour('handover')) {
          startRef.current?.();
          markTourSeen('handover');
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
          <Text style={styles.topBarSubtitle}>Logistik Berkas Cabang</Text>
          <Text style={styles.topBarTitle}>Serah Terima BPKB</Text>
        </View>
        <TouchableOpacity
          style={styles.topBarRightSlot}
          onPress={() => canStart && start()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka Panduan Serah Terima">
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
          text="Panduan serah terima BPKB fisik kepada kurir atau dealer. Bukti surat tanda terima difoto sebagai arsip digital."
          borderRadius={20}
          shape="rectangle">
          <View style={styles.bannerCard}>
            <Text style={styles.bannerHeading}>Bukti Serah Terima Bertanda Tangan</Text>
            <Text style={styles.bannerBody}>
              Ketika dealer menjemput tumpukan fisik BPKB di meja
              scanner, lakukan pemotretan lembar surat tanda terima yang telah
              ditandatangani sebagai arsip digital resmi.
            </Text>
          </View>
        </TourGuideZone>

        <View style={styles.list}>
          {HANDOVER_LIST.map((item, index) => {
            const isDone = item.status === 'Selesai';
            const cardContent = (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.dealerRow}>
                    <View style={styles.codePill}>
                      <Text style={styles.codeText}>{item.dealerCode}</Text>
                    </View>
                    <View style={styles.dealerMeta}>
                      <Text style={styles.dealerName}>{item.dealerName}</Text>
                      <Text style={styles.suratText}>No: {item.suratNumber}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isDone ? styles.statusPillDone : styles.statusPillPending,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        isDone ? styles.statusTextDone : styles.statusTextPending,
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Jumlah Berkas</Text>
                    <Text style={styles.metricValue}>{item.documentCount} BPKB</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Waktu Penjemputan</Text>
                    <Text style={styles.metricValue}>{item.timestamp}</Text>
                  </View>
                </View>

                <Text style={styles.notesText}>{item.notes}</Text>

                {index === 0 ? (
                  <TourGuideZone
                    zone={3}
                    text="Ketuk tombol ini untuk memotret atau meninjau lembar tanda terima fisik bertanda tangan basah."
                    borderRadius={12}
                    shape="rectangle">
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        isDone ? styles.actionBtnDone : styles.actionBtnPending,
                      ]}
                      activeOpacity={0.8}>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                          stroke={isDone ? Colors.primary : Colors.white}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                          stroke={isDone ? Colors.primary : Colors.white}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text
                        style={[
                          styles.actionBtnText,
                          isDone
                            ? styles.actionBtnTextDone
                            : styles.actionBtnTextPending,
                        ]}>
                        {item.hasSignedPhoto
                          ? 'Lihat Foto Surat Bertanda Tangan'
                          : 'Foto Surat Yang Ditandatangani'}
                      </Text>
                    </TouchableOpacity>
                  </TourGuideZone>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isDone ? styles.actionBtnDone : styles.actionBtnPending,
                    ]}
                    activeOpacity={0.8}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                        stroke={isDone ? Colors.primary : Colors.white}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                        stroke={isDone ? Colors.primary : Colors.white}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text
                      style={[
                        styles.actionBtnText,
                        isDone
                          ? styles.actionBtnTextDone
                          : styles.actionBtnTextPending,
                      ]}>
                      {item.hasSignedPhoto
                        ? 'Lihat Foto Surat Bertanda Tangan'
                        : 'Foto Surat Yang Ditandatangani'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );

            if (index === 0) {
              return (
                <TourGuideZone
                  key={item.id}
                  zone={2}
                  text="Kartu serah terima memuat kode cabang, nomor surat jalan, jumlah berkas BPKB, dan status verifikasi."
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
  bannerCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  codePill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
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
  suratText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  statusPillDone: {
    backgroundColor: Colors.secondary,
  },
  statusPillPending: {
    backgroundColor: Colors.surfaceAlt,
  },
  statusText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
  },
  statusTextDone: {
    color: Colors.primary,
  },
  statusTextPending: {
    color: Colors.textTertiary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  metricLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.textHeadline,
  },
  notesText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11.5,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: Radius.full,
    gap: 8,
  },
  actionBtnDone: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnPending: {
    backgroundColor: Colors.primary,
  },
  actionBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  actionBtnTextDone: {
    color: Colors.primary,
  },
  actionBtnTextPending: {
    color: Colors.white,
  },
});
