import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute, type RouteProp} from '@react-navigation/native';
import CollapsibleTopAppBar, {
  useCollapsibleHeader,
  EXPANDED_HEIGHT,
} from '../../components/CollapsibleTopAppBar';
import {NotificationIcon, CheckIcon, XIcon} from '../../components/TabIcons';
import {useTabNav} from '../../contexts/TabNavContext';
import {useBpkbStream} from '../../hooks/useBpkbStream';
import {trackBpkb, type BpkbTrackResponse} from '../../api/endpoints';
import type {BatchStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';

type TrackRoute = RouteProp<BatchStackParamList, 'TrackStatus'>;

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
  const {scrollY, onScroll} = useCollapsibleHeader();
  const {setActiveTab} = useTabNav();
  const route = useRoute<TrackRoute>();

  const paramTrackId = route.params?.trackId;

  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackId, setTrackId] = useState<string | null>(paramTrackId ?? null);
  const [trackDetail, setTrackDetail] = useState<BpkbTrackResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {data, connected} = useBpkbStream(trackId);

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
    if (paramTrackId) {
      setTrackId(paramTrackId);
    }
  }, [paramTrackId]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const detail = await trackBpkb(id);
      setTrackDetail(detail);
    } catch {}
  }, []);

  useEffect(() => {
    if (trackId) {
      fetchDetail(trackId);
    }
  }, [trackId, fetchDetail]);

  const pulseStyle = useAnimatedStyle(() => ({opacity: pulse.value}));

  const handleTrack = useCallback(() => {
    const trimmed = trackIdInput.trim();
    if (trimmed) {
      setTrackId(trimmed);
      setTrackDetail(null);
    }
  }, [trackIdInput]);

  const handleRefresh = useCallback(async () => {
    if (!trackId) {return;}
    setRefreshing(true);
    await fetchDetail(trackId);
    setRefreshing(false);
  }, [trackId, fetchDetail]);

  const currentStageIdx = getStageIndex(data?.stage ?? trackDetail?.stage ?? 'pending');
  const currentStatus = data?.status ?? trackDetail?.status ?? 'queued';
  const isFailed = currentStatus === 'failed';
  const isCompleted = currentStatus === 'completed';
  const errorMessage = data?.error_message ?? trackDetail?.error_message;
  const pdfUrl = data?.pdf_url;

  const showDetail = !!trackDetail;
  const showStepper = !!trackId;

  return (
    <View style={styles.screen}>
      <CollapsibleTopAppBar
        title="Status Proses"
        subtitle="Lacak pemrosesan BPKB"
        scrollY={scrollY}
        onBack={() => setActiveTab(0)}
        actions={[
          {icon: <NotificationIcon color={Colors.neutral} />, onPress: () => {}, accessibilityLabel: 'Notifikasi'},
        ]}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingTop: EXPANDED_HEIGHT + insets.top}]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }>
        <View style={styles.content}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Track ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan Track ID"
                placeholderTextColor={Colors.border}
                value={trackIdInput}
                onChangeText={setTrackIdInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.trackButton} onPress={handleTrack} activeOpacity={0.8}>
                <Text style={styles.trackButtonText}>Lacak</Text>
              </TouchableOpacity>
            </View>
            {trackId && connected && (
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {showDetail && trackDetail && (
            <View style={styles.detailCard}>
              <DetailRow label="Konsumen" value={trackDetail.nama_konsumen ?? '-'} />
              <DetailRow label="No Mesin" value={trackDetail.no_mesin} />
              <DetailRow label="No BPKB" value={trackDetail.no_bpkb} />
              <DetailRow label="Track ID" value={trackDetail.id} mono />
            </View>
          )}

          {showStepper && (
            <View style={styles.stepperCard}>
              <Text style={styles.stepperTitle}>Progress</Text>
              {STAGE_META.map((stage, idx) => {
                const isDone = isFailed ? idx < currentStageIdx : idx < currentStageIdx;
                const isActive = !isFailed && !isCompleted && idx === currentStageIdx;
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
                        {isDone && <CheckIcon size={14} color="#FFFFFF" />}
                        {isCurrentFailed && <XIcon size={14} color="#FFFFFF" />}
                        {isActive && <Animated.View style={[styles.stepPulse, pulseStyle]} />}
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
                          !isDone && !isActive && !isCurrentFailed && styles.stepLabelPending,
                        ]}>
                        {stage.label}
                      </Text>
                      {isActive && currentStatus === 'processing' && (
                        <Text style={styles.stepHint}>sedang diproses...</Text>
                      )}
                      {isCurrentFailed && (
                        <Text style={styles.stepHintFailed}>gagal</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {showStepper && isCompleted && pdfUrl && (
            <TouchableOpacity
              style={styles.pdfButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(pdfUrl)}>
              <Text style={styles.pdfButtonText}>Buka PDF</Text>
            </TouchableOpacity>
          )}

          {showStepper && isCompleted && !pdfUrl && trackDetail?.pdf_path && (
            <TouchableOpacity
              style={styles.pdfButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`${trackDetail.pdf_path}`)}>
              <Text style={styles.pdfButtonText}>Buka PDF</Text>
            </TouchableOpacity>
          )}

          {showStepper && isFailed && errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {showStepper && !data && !trackDetail && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingText}>Menunggu update dari server...</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function DetailRow({label, value, mono}: {label: string; value: string; mono?: boolean}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailValueMono]} numberOfLines={1}>
        {value}
      </Text>
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
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  inputLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    color: Colors.neutral,
    opacity: 0.6,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.neutral,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  trackButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  liveText: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 11,
    color: '#16a34a',
    letterSpacing: 1,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    gap: 12,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    color: Colors.neutral,
    opacity: 0.5,
  },
  detailValue: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.neutral,
  },
  detailValueMono: {
    fontFamily: Fonts.body.regular,
    fontSize: 12,
    color: Colors.neutral,
    opacity: 0.7,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stepperTitle: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.neutral,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  stepLineCol: {
    width: 32,
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotFailed: {
    backgroundColor: Colors.destructive,
    borderColor: Colors.destructive,
  },
  stepPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: '#16a34a',
  },
  stepLineFailed: {
    backgroundColor: Colors.destructive,
    opacity: 0.3,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 15,
  },
  stepLabelDone: {
    color: '#16a34a',
  },
  stepLabelActive: {
    fontFamily: Fonts.body.semiBold,
    color: Colors.primary,
  },
  stepLabelFailed: {
    color: Colors.destructive,
    fontFamily: Fonts.body.semiBold,
  },
  stepLabelPending: {
    color: Colors.neutral,
    opacity: 0.35,
  },
  stepHint: {
    fontFamily: Fonts.body.regular,
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 2,
  },
  stepHintFailed: {
    fontFamily: Fonts.body.regular,
    fontSize: 12,
    color: Colors.destructive,
    opacity: 0.7,
    marginTop: 2,
  },
  pdfButton: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfButtonText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: Colors.destructive,
    marginBottom: 6,
  },
  errorText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.destructive,
    lineHeight: 20,
  },
  waitingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waitingText: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.5,
  },
});
