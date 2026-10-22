import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import LottieView from 'lottie-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Spacing, Radius, Animations} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {getDealer, type DealerData} from '../../api';
import {extractNoMesinCandidates} from '../../utils/noMesin';
import {scanQueue} from '../../utils/scanQueue';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import ThumbnailStrip from '../../components/ThumbnailStrip';
import ScanTopDealerAlert from '../../components/ScanTopDealerAlert';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep3'>;
type Phase = 'camera' | 'processing' | 'result';
type VerificationStatus = 'verifying' | 'matched' | 'unverified';

async function verifyCandidateWithTimeout(
  candidate: string,
  timeoutMs = 2000,
): Promise<DealerData | null> {
  return Promise.race([
    getDealer(candidate),
    new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export default function ScanStep3Screen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto3, setNomesin, setDealer, state} = useScan();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const [phase, setPhase] = useState<Phase>('camera');
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('verifying');
  const [displayedNoMesin, setDisplayedNoMesin] = useState('');
  const [dealerInfo, setDealerInfo] = useState('');
  const isProcessingRef = useRef(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proceedToNextStep = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
    }
    isProcessingRef.current = false;
    if (route.params?.returnToReview) {
      navigation.navigate('ScanReview');
      return;
    }
    if (route.params?.returnToStep) {
      navigation.navigate(`ScanStep${route.params.returnToStep}` as any);
      return;
    }
    navigation.navigate('ScanStep4');
  }, [navigation, route.params]);

  useFocusEffect(
    useCallback(() => {
      setPhase('camera');
      setVerificationStatus('verifying');
      setDisplayedNoMesin('');
      setDealerInfo('');
      isProcessingRef.current = false;
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
        nextTimerRef.current = null;
      }
      return () => {
        if (nextTimerRef.current) {
          clearTimeout(nextTimerRef.current);
          nextTimerRef.current = null;
        }
        isProcessingRef.current = false;
      };
    }, [])
  );

  const handleCapture = useCallback(
    async (img: ScanImage, layout?: {width: number; height: number}) => {
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;

      haptic('capture');
      playSound('tick');
      setPhase('processing');
      setVerificationStatus('verifying');
      setDisplayedNoMesin('');
      setDealerInfo('');
      setPhoto3(img);

      scanQueue.enqueue({
        step: 3,
        rawUri: img.uri,
        filename: 'hal3.jpg',
        viewWidth: layout?.width,
        viewHeight: layout?.height,
        onDone: setPhoto3,
      });

      let detectedNoMesin = '';
      let matchedDealer: DealerData | null = null;

      try {
        const recognized = await TextRecognition.recognize(img.uri);
        const candidates = extractNoMesinCandidates(recognized);
        if (candidates.length > 0) {
          detectedNoMesin = candidates[0];
          setDisplayedNoMesin(detectedNoMesin);
          matchedDealer = await verifyCandidateWithTimeout(
            detectedNoMesin,
            2000,
          );
        }
      } catch {}

      if (detectedNoMesin) {
        setNomesin(detectedNoMesin);
        if (matchedDealer) {
          setDealer(matchedDealer);
          setDealerInfo(matchedDealer.nm_dealer);
          setVerificationStatus('matched');
          haptic('success');
          playSound('success');
        } else {
          setVerificationStatus('unverified');
          haptic('detect');
        }
      } else {
        setDisplayedNoMesin('-');
        setVerificationStatus('unverified');
        haptic('detect');
      }

      setPhase('result');

      const delayMs = matchedDealer ? 2200 : 2600;
      nextTimerRef.current = setTimeout(() => {
        proceedToNextStep();
      }, delayMs);
    },
    [
      haptic,
      playSound,
      proceedToNextStep,
      setDealer,
      setNomesin,
      setPhoto3,
    ],
  );

  const isFocused = useIsFocused();
  const swallowKey = useCallback(() => {}, []);
  useHardwareKey(swallowKey, isFocused && phase === 'processing', 'volumeDown');
  useHardwareKey(proceedToNextStep, isFocused && phase === 'result', 'volumeDown');

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + Spacing.sm},
      ]}>
      <ScanStepIndicator currentStep={3} totalSteps={5} />

      {phase === 'result' && state.dealer ? (
        <ScanTopDealerAlert
          dealerName={state.dealer.nm_dealer}
          paymentType={state.dealer.payment_type}
        />
      ) : phase === 'result' && !state.dealer ? (
        <ScanTopDealerAlert
          nomesin={state.nomesin}
          isUnverified={true}
        />
      ) : null}

      <View style={styles.cameraArea}>
        <PedalCamera
          filename="hal3.jpg"
          onCapture={handleCapture}
          overlayVariant="document"
          isActive={phase === 'camera'}
        />

        {(phase === 'processing' || phase === 'result') && (
          <View style={styles.centeredCardOverlay} pointerEvents="auto">
            <View style={styles.transitionCard}>
              <View style={styles.lottieBox}>
                {phase === 'processing' ? (
                  <LottieView
                    source={Animations.frame}
                    autoPlay
                    loop
                    style={styles.lottieAnim}
                  />
                ) : verificationStatus === 'matched' ? (
                  <LottieView
                    source={Animations.success}
                    autoPlay
                    loop={false}
                    style={styles.lottieAnim}
                  />
                ) : (
                  <View style={styles.unverifiedBadge}>
                    <Text style={styles.unverifiedBadgeText}>INFO</Text>
                  </View>
                )}
              </View>

              <Text style={styles.transitionStatusLabel}>
                {phase === 'processing'
                  ? 'Mencocokkan Nomor Mesin...'
                  : verificationStatus === 'matched'
                  ? 'Nomor Mesin Terverifikasi'
                  : 'Nomor Mesin Tersimpan'}
              </Text>

              <View style={styles.noMesinBox}>
                <Text style={styles.noMesinText}>
                  {displayedNoMesin || 'Memindai...'}
                </Text>
              </View>

              <Text style={styles.transitionSubText}>
                {phase === 'processing'
                  ? 'Memvalidasi data ke database dealer'
                  : verificationStatus === 'matched'
                  ? dealerInfo
                    ? `Dealer: ${dealerInfo}`
                    : 'Data dealer terhubung'
                  : 'Data belum terdaftar di database, dapat dilengkapi di web'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ThumbnailStrip currentStep={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  cameraArea: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  centeredCardOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: Colors.centeredModalBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: Spacing.lg,
  },
  transitionCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  lottieBox: {
    width: 76,
    height: 76,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnim: {
    width: 76,
    height: 76,
  },
  unverifiedBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.warningLight,
    borderWidth: 2,
    borderColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unverifiedBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  transitionStatusLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: Colors.textHeadline,
    textAlign: 'center',
    marginBottom: 4,
  },
  noMesinBox: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  noMesinText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    color: Colors.textHeadline,
    letterSpacing: 1.2,
  },
  transitionSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});