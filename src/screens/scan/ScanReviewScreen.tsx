import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Typography, Spacing, Radius} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {processBpkb} from '../../api';
import {scanQueue} from '../../utils/scanQueue';
import ScanTopDealerAlert from '../../components/ScanTopDealerAlert';
import SubmitBpkbModal from '../../components/SubmitBpkbModal';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanReview'>;

interface SlideItem {
  step: 1 | 2 | 3 | 4;
  title: string;
  routeName: 'ScanStep1' | 'ScanStep2' | 'ScanStep3' | 'ScanStep4';
}

const SLIDES: SlideItem[] = [
  {step: 1, title: 'Identitas Pemilik', routeName: 'ScanStep1'},
  {step: 2, title: 'Identitas Kendaraan', routeName: 'ScanStep2'},
  {step: 3, title: 'No Mesin & Spesifikasi', routeName: 'ScanStep3'},
  {step: 4, title: 'Dokumen Persyaratan', routeName: 'ScanStep4'},
];

export default function ScanReviewScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();
  const {state, resetScan} = useScan();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'submitting' | 'success'>('submitting');
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorText, setErrorText] = useState('');
  const isSubmittingRef = useRef(false);

  const photos = [state.photo1, state.photo2, state.photo3, state.photo4];
  const carouselWidth = screenWidth - Spacing.lg * 2;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / carouselWidth);
      if (index >= 0 && index < SLIDES.length) {
        setActiveIndex(index);
      }
    },
    [carouselWidth],
  );

  const handleRetakeCurrent = useCallback(() => {
    const target = SLIDES[activeIndex];
    if (target) {
      navigation.navigate(target.routeName, {returnToReview: true});
    }
  }, [activeIndex, navigation]);

  const doSubmit = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }
    if (!state.photo1 || !state.photo2 || !state.photo3 || !state.photo4) {
      setErrorText('Foto dokumen belum lengkap.');
      haptic('error');
      playSound('error');
      return;
    }

    isSubmittingRef.current = true;
    setErrorText('');
    setSubmitStatus('submitting');
    setShowSubmitModal(true);

    try {
      await scanQueue.waitForAll();
      await processBpkb(state.nomesin, state.nobpkb, [
        state.photo1,
        state.photo2,
        state.photo3,
        state.photo4,
      ]);

      haptic('submit');
      playSound('submit');
      setShowConfetti(true);
      setSubmitStatus('success');
    } catch (error: any) {
      setShowSubmitModal(false);
      const message = error?.data?.errors
        ? Object.values(error.data.errors).flat().join('\n')
        : error?.data?.message || 'Gagal mengirim berkas ke server.';
      setErrorText(message);
      haptic('error');
      playSound('error');
    } finally {
      isSubmittingRef.current = false;
    }
  }, [haptic, playSound, state]);

  const handleFinishSubmit = useCallback(() => {
    setShowSubmitModal(false);
    setShowConfetti(false);
    resetScan();
    navigation.navigate('ScanStep1');
  }, [navigation, resetScan]);

  useHardwareKey(doSubmit, !showSubmitModal, 'volumeDown');
  useHardwareKey(handleRetakeCurrent, !showSubmitModal, 'volumeUp');

  const renderSlide = useCallback(
    ({item, index}: {item: SlideItem; index: number}) => {
      const photo = photos[index];
      const isProcessing = photo?.isProcessing;

      return (
        <View style={[styles.slideContainer, {width: carouselWidth}]}>
          <View style={styles.imageCard}>
            {photo?.uri ? (
              <Image
                source={{uri: photo.uri}}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.emptyPhotoBox}>
                <Text style={styles.emptyPhotoText}>Belum Ada Foto</Text>
              </View>
            )}

            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="small" color={Colors.emeraldMint} />
                <Text style={styles.processingText}>Memproses dokumen...</Text>
              </View>
            )}

            <View style={styles.slideHeaderPill}>
              <Text style={styles.slideStepLabel}>
                Halaman {item.step}: {item.title}
              </Text>
            </View>

            <View style={styles.slideCounterPill}>
              <Text style={styles.slideCounterText}>
                {item.step} / {SLIDES.length}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [carouselWidth, photos],
  );

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.sm},
      ]}>
      {state.dealer ? (
        <ScanTopDealerAlert
          dealerName={state.dealer.nm_dealer}
          paymentType={state.dealer.payment_type}
        />
      ) : null}

      <View style={styles.bpkbCard}>
        <View style={styles.bpkbCardHeader}>
          <Text style={styles.bpkbLabel}>Nomor BPKB</Text>
          {state.nomesin ? (
            <Text style={styles.mesinLabel}>Mesin: {state.nomesin}</Text>
          ) : null}
        </View>
        <Text style={styles.bpkbValue}>{state.nobpkb || '-'}</Text>
      </View>

      <View style={styles.carouselSection}>
        <FlatList
          data={SLIDES}
          keyExtractor={item => item.routeName}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          snapToInterval={carouselWidth}
          decelerationRate="fast"
          style={styles.flatList}
        />

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

      <View style={styles.footerSection}>
        <Text style={styles.pedalInstruction}>
          Injak pedal kaki untuk kirim berkas
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.retakeBtn}
            activeOpacity={0.8}
            onPress={handleRetakeCurrent}>
            <Text style={styles.retakeBtnText}>
              Foto Ulang Hal {activeIndex + 1}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.85}
            onPress={doSubmit}>
            <Text style={styles.sendBtnText}>Kirim Berkas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SubmitBpkbModal
        visible={showSubmitModal}
        status={submitStatus}
        onFinish={handleFinishSubmit}
      />

      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{x: screenWidth / 2, y: -20}}
          fadeOut
          fallSpeed={2800}
          explosionSpeed={350}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  bpkbCard: {
    backgroundColor: Colors.neutral,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
    marginBottom: Spacing.sm,
  },
  bpkbCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  bpkbLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11.5,
    color: Colors.emeraldMint,
  },
  mesinLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  bpkbValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    color: Colors.white,
    letterSpacing: 0.8,
  },
  carouselSection: {
    flex: 1,
    marginBottom: Spacing.xs,
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingVertical: 4,
  },
  imageCard: {
    flex: 1,
    backgroundColor: Colors.neutral,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
  },
  emptyPhotoBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
  processingOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.emeraldMint,
    gap: 8,
  },
  processingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.emeraldMint,
  },
  slideHeaderPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.dimDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
  },
  slideStepLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.white,
  },
  slideCounterPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.dimDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
  },
  slideCounterText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: Colors.emeraldMint,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.emeraldMint,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.paginationInactive,
  },
  errorBanner: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 6,
  },
  footerSection: {
    alignItems: 'center',
    gap: 8,
  },
  pedalInstruction: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  retakeBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
    backgroundColor: Colors.darkCardBg,
  },
  retakeBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.white,
  },
  sendBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  sendBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: Colors.white,
  },
});
