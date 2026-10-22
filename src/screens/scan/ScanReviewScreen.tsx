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
import {useIsFocused} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import Svg, {Path} from 'react-native-svg';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Typography, Spacing, Radius} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
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
  const isFocused = useIsFocused();
  const {width: screenWidth} = useWindowDimensions();
  const {state, setPhoto1, setPhoto2, setPhoto3, setPhoto4, resetScan} = useScan();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'submitting' | 'success'>('submitting');
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [rotating, setRotating] = useState(false);
  const isSubmittingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const photos = [state.photo1, state.photo2, state.photo3, state.photo4];
  const carouselWidth = screenWidth - Spacing.lg * 2;

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < SLIDES.length) {
        flatListRef.current?.scrollToIndex({index, animated: true});
        setActiveIndex(index);
        haptic('detect');
        playSound('tick');
      }
    },
    [haptic, playSound],
  );

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  }, [activeIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  }, [activeIndex, scrollToIndex]);

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

  const handleRotateCurrent = useCallback(async () => {
    const photo = photos[activeIndex];
    if (!photo?.uri || rotating) {
      return;
    }
    setRotating(true);
    haptic('detect');
    playSound('tick');
    try {
      const res = await ImageResizer.createResizedImage(
        photo.uri,
        1920,
        1920,
        'JPEG',
        90,
        180,
      );
      const updated: ScanImage = {
        ...photo,
        uri: res.uri,
      };
      if (activeIndex === 0) setPhoto1(updated);
      else if (activeIndex === 1) setPhoto2(updated);
      else if (activeIndex === 2) setPhoto3(updated);
      else if (activeIndex === 3) setPhoto4(updated);
    } catch {
    } finally {
      setRotating(false);
    }
  }, [activeIndex, haptic, photos, playSound, rotating, setPhoto1, setPhoto2, setPhoto3, setPhoto4]);

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
      isSubmittingRef.current = false;
    }
  }, [haptic, playSound, state]);

  const handleFinishSubmit = useCallback(() => {
    isSubmittingRef.current = false;
    setShowSubmitModal(false);
    setShowConfetti(false);
    resetScan();
    navigation.navigate('ScanStep1');
  }, [navigation, resetScan]);

  useHardwareKey(doSubmit, isFocused && !showSubmitModal, 'volumeDown');
  useHardwareKey(handleRetakeCurrent, isFocused && !showSubmitModal, 'volumeUp');

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

            <View style={styles.topPillRow}>
              <View style={styles.slideHeaderPill}>
                <Text style={styles.slideStepLabel}>
                  Halaman {item.step}: {item.title}
                </Text>
              </View>

              <View style={styles.topRightActions}>
                <TouchableOpacity
                  style={styles.rotateBtn}
                  activeOpacity={0.7}
                  onPress={handleRotateCurrent}
                  accessibilityLabel="Putar gambar 180 derajat"
                  accessibilityRole="button"
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  {rotating && activeIndex === index ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5"
                        stroke={Colors.primary}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>

                <View style={styles.slideCounterPill}>
                  <Text style={styles.slideCounterText}>
                    {item.step} / {SLIDES.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    },
    [activeIndex, carouselWidth, handleRotateCurrent, photos, rotating],
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
      ) : (
        <ScanTopDealerAlert
          nomesin={state.nomesin}
          isUnverified={true}
        />
      )}

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
          ref={flatListRef}
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

        <TouchableOpacity
          style={[
            styles.navArrowBtn,
            styles.navArrowLeft,
            activeIndex === 0 && styles.navArrowDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handlePrev}
          disabled={activeIndex === 0}
          accessibilityLabel="Halaman sebelumnya"
          accessibilityRole="button"
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={activeIndex === 0 ? Colors.textTertiary : Colors.textPrimary}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navArrowBtn,
            styles.navArrowRight,
            activeIndex === SLIDES.length - 1 && styles.navArrowDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handleNext}
          disabled={activeIndex === SLIDES.length - 1}
          accessibilityLabel="Halaman berikutnya"
          accessibilityRole="button"
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18l6-6-6-6"
              stroke={
                activeIndex === SLIDES.length - 1
                  ? Colors.textTertiary
                  : Colors.textPrimary
              }
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => scrollToIndex(i)}
              hitSlop={{top: 10, bottom: 10, left: 6, right: 6}}
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bpkbCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bpkbLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11.5,
    color: Colors.primary,
  },
  mesinLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bpkbValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    color: Colors.textHeadline,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.emeraldMint,
    gap: 8,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  processingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: Colors.emeraldMint,
  },
  topPillRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slideHeaderPill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  slideStepLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rotateBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  slideCounterPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  slideCounterText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: Colors.textHeadline,
  },
  navArrowBtn: {
    position: 'absolute',
    top: '44%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.navButtonBorder,
    zIndex: 10,
  },
  navArrowLeft: {
    left: 8,
  },
  navArrowRight: {
    right: 8,
  },
  navArrowDisabled: {
    opacity: 0.22,
    backgroundColor: Colors.navButtonDisabledBg,
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
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.borderLight,
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  retakeBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12.5,
    color: Colors.textHeadline,
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
