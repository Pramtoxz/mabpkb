import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {Config} from 'react-native-config';
import {Colors, Spacing, Radius} from '../../constants';
import {useTabNav} from '../../contexts/TabNavContext';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useBpkbStream} from '../../hooks/useBpkbStream';
import {
  trackBpkb,
  type BpkbTrackResponse,
  type BpkbHistoryItem,
} from '../../api/endpoints';
import DateFilterModal, {type DateRange} from '../../components/DateFilterModal';
import mockHistory from '../../mock/history.json';

dayjs.locale('id');

const STAGE_META: {key: string; label: string}[] = [
  {key: 'pending', label: 'Queued'},
  {key: 'create_pdf', label: 'Buat PDF'},
  {key: 'update_stok_unit', label: 'Update Stok'},
  {key: 'update_tgl_bpkb_siap', label: 'Update Tanggal'},
  {key: 'completed', label: 'Selesai'},
];

function getStageIndex(stage: string): number {
  const idx = STAGE_META.findIndex(s => s.key === stage);
  return idx >= 0 ? idx : 0;
}

export default function TrackStatusScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const {
    setActiveTab,
    pendingTrackId,
    setPendingTrackId,
    setIsPedalIntercepted,
  } = useTabNav();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();

  const [trackId, setTrackId] = useState<string | null>(
    route.params?.trackId ?? null,
  );
  const [trackDetail, setTrackDetail] = useState<BpkbTrackResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSegment, setActiveSegment] = useState<'history' | 'sorting'>('history');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const {data} = useBpkbStream(trackId);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 800, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.3, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    if (pendingTrackId) {
      setTrackId(pendingTrackId);
      setPendingTrackId(null);
    }
  }, [pendingTrackId, setPendingTrackId]);

  useEffect(() => {
    if (route.params?.trackId) {
      setTrackId(route.params.trackId);
    }
  }, [route.params?.trackId]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const detail = await trackBpkb(id);
      setTrackDetail(detail);
    } catch {
      const localFound = (mockHistory as BpkbHistoryItem[]).find(h => h.id === id);
      if (localFound) {
        setTrackDetail({
          id: localFound.id,
          no_mesin: localFound.no_mesin,
          no_bpkb: localFound.no_bpkb,
          nama_konsumen: localFound.nama_konsumen,
          pdf_path: localFound.pdf_url,
          image_paths: null,
          stage: localFound.stage,
          status: localFound.status,
          error_message: null,
          created_at: localFound.created_at,
          updated_at: localFound.created_at,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (trackId) {
      fetchDetail(trackId);
    }
  }, [trackId, fetchDetail]);

  const pulseStyle = useAnimatedStyle(() => ({opacity: pulse.value}));

  const currentStageIdx = getStageIndex(data?.stage ?? trackDetail?.stage ?? 'pending');
  const currentStatus = data?.status ?? trackDetail?.status ?? 'queued';
  const isFailed = currentStatus === 'failed';
  const isCompleted = currentStatus === 'completed';
  const errorMessage = data?.error_message ?? trackDetail?.error_message;
  const pdfRelative = data?.pdf_url ?? trackDetail?.pdf_path;

  const buildPdfUrl = (path: string) => {
    if (path.startsWith('http')) {
      return path;
    }
    const base = Config.API_BASE_URL ?? '';
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  };

  const handleScanNext = useCallback(() => {
    haptic('submit');
    playSound('beep');
    setTrackId(null);
    setTrackDetail(null);
    setActiveTab(1);
  }, [haptic, playSound, setActiveTab]);

  useHardwareKey(
    handleScanNext,
    isFocused && Boolean(trackId) && (isCompleted || isFailed),
    'volumeDown',
  );

  useEffect(() => {
    if (isFocused && Boolean(trackId) && (isCompleted || isFailed)) {
      setIsPedalIntercepted(true);
      return () => {
        setIsPedalIntercepted(false);
      };
    }
  }, [isFocused, trackId, isCompleted, isFailed, setIsPedalIntercepted]);

  const handleRefresh = useCallback(async () => {
    if (!trackId) {
      return;
    }
    setRefreshing(true);
    await fetchDetail(trackId);
    setRefreshing(false);
  }, [trackId, fetchDetail]);

  const handleBack = () => {
    if (trackId) {
      setTrackId(null);
      setTrackDetail(null);
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      setActiveTab(0);
    }
  };

  const filteredHistory = useMemo(() => {
    let list: BpkbHistoryItem[] = mockHistory as BpkbHistoryItem[];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        item =>
          item.no_bpkb.toLowerCase().includes(q) ||
          item.no_mesin.toLowerCase().includes(q) ||
          (item.nama_konsumen && item.nama_konsumen.toLowerCase().includes(q)) ||
          item.dealer_name.toLowerCase().includes(q) ||
          item.dealer_code.toLowerCase().includes(q),
      );
    }
    if (appliedDateRange.startDate) {
      const start = dayjs(appliedDateRange.startDate).startOf('day');
      const end = appliedDateRange.endDate
        ? dayjs(appliedDateRange.endDate).endOf('day')
        : start.endOf('day');
      list = list.filter(item => {
        const itemDate = dayjs(item.created_at);
        return (
          itemDate.isSame(start) ||
          itemDate.isSame(end) ||
          (itemDate.isAfter(start) && itemDate.isBefore(end))
        );
      });
    }
    return list;
  }, [search, appliedDateRange]);

  const sortingGroups = useMemo(() => {
    const groups: Record<
      string,
      {code: string; name: string; count: number; items: BpkbHistoryItem[]}
    > = {};

    filteredHistory.forEach(item => {
      if (!groups[item.dealer_code]) {
        groups[item.dealer_code] = {
          code: item.dealer_code,
          name: item.dealer_name,
          count: 0,
          items: [],
        };
      }
      groups[item.dealer_code].count += 1;
      groups[item.dealer_code].items.push(item);
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [filteredHistory]);

  const formattedAppliedDate = useMemo(() => {
    if (!appliedDateRange.startDate) {
      return null;
    }
    const start = dayjs(appliedDateRange.startDate).format('D MMM YYYY');
    if (
      !appliedDateRange.endDate ||
      appliedDateRange.startDate === appliedDateRange.endDate
    ) {
      return start;
    }
    const end = dayjs(appliedDateRange.endDate).format('D MMM YYYY');
    return `${start} - ${end}`;
  }, [appliedDateRange]);

  if (trackId) {
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
            onPress={handleBack}
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
            <Text style={styles.topBarSubtitle}>Antrean Pemrosesan</Text>
            <Text style={styles.topBarTitle}>Status Proses BPKB</Text>
          </View>
          <View style={styles.topBarRightSlot} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Spacing.huge + insets.bottom},
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }>
          {trackDetail && (
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailPill}>
                  <Text style={styles.detailPillText}>
                    {trackDetail.no_bpkb}
                  </Text>
                </View>
                <Text style={styles.detailTrackId}>ID: {trackDetail.id}</Text>
              </View>
              <View style={styles.detailDivider} />
              <DetailRow
                label="Konsumen"
                value={trackDetail.nama_konsumen ?? '-'}
              />
              <DetailRow label="No Mesin" value={trackDetail.no_mesin} />
            </View>
          )}

          <View style={styles.stepperCard}>
            <Text style={styles.stepperTitle}>Tahapan Proses</Text>
            {STAGE_META.map((stage, idx) => {
              const isDone = isFailed
                ? idx < currentStageIdx
                : idx < currentStageIdx || (isCompleted && idx === currentStageIdx);
              const isActive =
                !isFailed && !isCompleted && idx === currentStageIdx;
              const isCurrentFailed = isFailed && idx === currentStageIdx;

              return (
                <View key={stage.key} style={styles.stepRow}>
                  <View style={styles.stepLineCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isActive && styles.stepDotActive,
                        isCurrentFailed && styles.stepDotFailed,
                      ]}>
                      {isDone && (
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M20 6L9 17l-5-5"
                            stroke={Colors.white}
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      )}
                      {isCurrentFailed && (
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M18 6L6 18M6 6l12 12"
                            stroke={Colors.white}
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      )}
                      {isActive && (
                        <Animated.View style={[styles.stepPulse, pulseStyle]} />
                      )}
                    </View>
                    {idx < STAGE_META.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isDone && styles.stepLineDone,
                          isCurrentFailed && styles.stepLineFailed,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && styles.stepLabelDone,
                        isActive && styles.stepLabelActive,
                        isCurrentFailed && styles.stepLabelFailed,
                      ]}>
                      {stage.label}
                    </Text>
                    {isActive && (
                      <Text style={styles.stepHint}>Sedang diproses server...</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {isCompleted && (
            <View style={styles.successBanner}>
              <View style={styles.successBadge}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17l-5-5"
                    stroke={Colors.white}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.successMeta}>
                <Text style={styles.successTitle}>BPKB Berhasil Diproses</Text>
                <Text style={styles.successDesc}>
                  PDF berkas telah dibuat dan data stok unit dealer berhasil diperbarui.
                </Text>
              </View>
            </View>
          )}

          {isCompleted && pdfRelative && (
            <TouchableOpacity
              style={styles.pdfButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(buildPdfUrl(pdfRelative))}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.pdfButtonText}>Lihat Dokumen PDF</Text>
            </TouchableOpacity>
          )}

          {isFailed && errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Kendala Pemrosesan</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {(isCompleted || isFailed) && (
            <View style={styles.ambientPedalBanner}>
              <View style={styles.ambientPedalDot} />
              <View style={styles.ambientPedalTextBox}>
                <Text style={styles.ambientPedalTitle}>
                  Injak Pedal Kaki untuk Scan Berkas Baru
                </Text>
                <Text style={styles.ambientPedalSubtitle}>
                  Kamera otomatis terbuka tanpa perlu menyentuh layar
                </Text>
              </View>
            </View>
          )}

          {(isCompleted || isFailed) && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.listReturnButton}
                activeOpacity={0.8}
                onPress={() => {
                  setTrackId(null);
                  setTrackDetail(null);
                }}>
                <Text style={styles.listReturnButtonText}>Semua Riwayat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scanNextButton}
                activeOpacity={0.85}
                onPress={handleScanNext}>
                <Text style={styles.scanNextButtonText}>Scan BPKB Baru</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

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
          onPress={handleBack}
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
          <Text style={styles.topBarSubtitle}>Statistik & Arsip Dokumen</Text>
          <Text style={styles.topBarTitle}>Riwayat BPKB</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.calendarButton,
            Boolean(appliedDateRange.startDate) && styles.calendarButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setShowDateFilter(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
              stroke={
                appliedDateRange.startDate ? Colors.primary : Colors.textHeadline
              }
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          {Boolean(appliedDateRange.startDate) && (
            <View style={styles.calendarDot} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.segmentWrapper}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeSegment === 'history' && styles.segmentItemActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveSegment('history')}>
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'history' && styles.segmentTextActive,
              ]}>
              Daftar Riwayat ({filteredHistory.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeSegment === 'sorting' && styles.segmentItemActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveSegment('sorting')}>
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'sorting' && styles.segmentTextActive,
              ]}>
              Rekap Sortir
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
            placeholder="Cari no BPKB, mesin, konsumen..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {formattedAppliedDate && (
        <View style={styles.filterBannerWrapper}>
          <View style={styles.filterBanner}>
            <View style={styles.filterBannerLeft}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.filterBannerText}>
                Filter: {formattedAppliedDate}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setDateRange({startDate: undefined, endDate: undefined});
                setAppliedDateRange({startDate: undefined, endDate: undefined});
              }}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={Colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Spacing.huge + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}>
        {activeSegment === 'history' ? (
          filteredHistory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Tidak ada berkas</Text>
              <Text style={styles.emptyDesc}>
                Tidak ditemukan data BPKB yang cocok dengan pencarian Anda.
              </Text>
            </View>
          ) : (
            filteredHistory.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyCard}
                activeOpacity={0.85}
                onPress={() => setTrackId(item.id)}>
                <View style={styles.historyCardTop}>
                  <View style={styles.bpkbPill}>
                    <Text style={styles.bpkbPillText}>{item.no_bpkb}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'completed'
                        ? styles.statusBadgeDone
                        : styles.statusBadgeProcess,
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'completed'
                          ? styles.statusBadgeTextDone
                          : styles.statusBadgeTextProcess,
                      ]}>
                      {item.status === 'completed' ? 'Selesai' : 'Diproses'}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyBody}>
                  <View style={styles.historyMetaRow}>
                    <Text style={styles.historyLabel}>No Mesin</Text>
                    <Text style={styles.historyValue}>{item.no_mesin}</Text>
                  </View>
                  <View style={styles.historyMetaRow}>
                    <Text style={styles.historyLabel}>Konsumen</Text>
                    <Text style={styles.historyValue}>
                      {item.nama_konsumen ?? '-'}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyFooter}>
                  <View style={styles.dealerInfo}>
                    <View style={styles.dealerCodeBadge}>
                      <Text style={styles.dealerCodeText}>
                        {item.dealer_code}
                      </Text>
                    </View>
                    <Text style={styles.dealerNameText} numberOfLines={1}>
                      {item.dealer_name}
                    </Text>
                  </View>
                  <Text style={styles.historyTimeText}>
                    {dayjs(item.created_at).format('DD/MM HH:mm')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          <View style={styles.sortingWrapper}>
            <View style={styles.sortingOverviewCard}>
              <Text style={styles.sortingOverviewLabel}>
                Rekap Sortir Meja Fisik
              </Text>
              <Text style={styles.sortingOverviewTitle}>
                {filteredHistory.length} Berkas Siap Diambil
              </Text>
              <Text style={styles.sortingOverviewDesc}>
                Berkas telah tersortir otomatis per cabang untuk mempermudah serah terima.
              </Text>
            </View>

            {sortingGroups.map(group => (
              <View key={group.code} style={styles.sortingCard}>
                <View style={styles.sortingCardLeft}>
                  <View style={styles.dealerCodeBadge}>
                    <Text style={styles.dealerCodeText}>{group.code}</Text>
                  </View>
                  <View style={styles.sortingMeta}>
                    <Text style={styles.sortingDealerName}>{group.name}</Text>
                    <Text style={styles.sortingStatusText}>
                      Siap serah terima berkas
                    </Text>
                  </View>
                </View>
                <View style={styles.sortingCountBadge}>
                  <Text style={styles.sortingCountNumber}>{group.count}</Text>
                  <Text style={styles.sortingCountUnit}>Berkas</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <DateFilterModal
        visible={showDateFilter}
        dateRange={dateRange}
        onClose={() => setShowDateFilter(false)}
        onDateRangeChange={params =>
          setDateRange({
            startDate: params.startDate,
            endDate: params.endDate,
          })
        }
        onApply={() => {
          setAppliedDateRange(dateRange);
          setShowDateFilter(false);
        }}
        onClear={() => {
          setDateRange({startDate: undefined, endDate: undefined});
          setAppliedDateRange({startDate: undefined, endDate: undefined});
          setShowDateFilter(false);
        }}
      />
    </View>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    width: 40,
  },
  calendarButton: {
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
    position: 'relative',
  },
  calendarButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  calendarDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  segmentWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  segmentItemActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    fontFamily: 'Poppins-Bold',
    color: Colors.textHeadline,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    color: Colors.textHeadline,
  },
  filterBannerWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  filterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterBannerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: 12,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bpkbPill: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  bpkbPillText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusBadgeDone: {
    backgroundColor: Colors.emeraldLight,
  },
  statusBadgeProcess: {
    backgroundColor: Colors.secondary,
  },
  statusBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
  },
  statusBadgeTextDone: {
    color: Colors.aciaxSuccessGreen,
  },
  statusBadgeTextProcess: {
    color: Colors.primary,
  },
  historyBody: {
    gap: 4,
    paddingVertical: 2,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  historyValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    color: Colors.textHeadline,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dealerCodeBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  dealerCodeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.primary,
  },
  dealerNameText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  historyTimeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10.5,
    color: Colors.textTertiary,
  },
  sortingWrapper: {
    gap: 12,
  },
  sortingOverviewCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sortingOverviewLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  sortingOverviewTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 4,
  },
  sortingOverviewDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sortingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  sortingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sortingMeta: {
    flex: 1,
  },
  sortingDealerName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.textHeadline,
    marginBottom: 2,
  },
  sortingStatusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sortingCountBadge: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  sortingCountNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  sortingCountUnit: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9.5,
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.textHeadline,
    marginBottom: 4,
  },
  emptyDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailPill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  detailPillText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  detailTrackId: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  detailValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.textHeadline,
  },
  stepperCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.textHeadline,
    marginBottom: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  stepLineCol: {
    width: 28,
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.emeraldMint,
    borderColor: Colors.emeraldMint,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotFailed: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  stepPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: Colors.emeraldMint,
  },
  stepLineFailed: {
    backgroundColor: Colors.error,
  },
  stepContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
    paddingBottom: Spacing.sm,
  },
  stepLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12.5,
    color: Colors.textTertiary,
  },
  stepLabelDone: {
    color: Colors.textHeadline,
    fontFamily: 'Poppins-Bold',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontFamily: 'Poppins-Bold',
  },
  stepLabelFailed: {
    color: Colors.error,
    fontFamily: 'Poppins-Bold',
  },
  stepHint: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: Colors.primary,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    gap: 10,
  },
  successBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMeta: {
    flex: 1,
  },
  successTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.aciaxSuccessGreen,
  },
  successDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.aciaxSuccessGreen,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    gap: 8,
  },
  pdfButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.primary,
  },
  errorCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.error,
    marginBottom: 2,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ambientPedalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emeraldLight,
    borderWidth: 1.5,
    borderColor: Colors.emeraldMint,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: 12,
  },
  ambientPedalDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldMint,
  },
  ambientPedalTextBox: {
    flex: 1,
  },
  ambientPedalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.aciaxSuccessGreen,
  },
  ambientPedalSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10.5,
    color: Colors.aciaxSuccessGreen,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  listReturnButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  listReturnButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12.5,
    color: Colors.textHeadline,
  },
  scanNextButton: {
    flex: 1.3,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  scanNextButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.white,
  },
});