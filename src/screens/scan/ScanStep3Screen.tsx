import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Typography, Spacing, Radius} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {getDealer, type DealerData} from '../../api';
import {
  extractNoMesinCandidates,
  normalizeNoMesin,
} from '../../utils/noMesin';
import {scanQueue} from '../../utils/scanQueue';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import ScanFeedback from '../../components/ScanFeedback';
import FloatingToast from '../../components/FloatingToast';
import ThumbnailStrip from '../../components/ThumbnailStrip';
import ScanTopDealerAlert from '../../components/ScanTopDealerAlert';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep3'>;
type Phase = 'camera' | 'processing' | 'result' | 'error';

const NEXT_STEP_DELAY_MS = 2500;
const TYPEWRITER_SPEED_MS = 50;

interface VerifiedNoMesin {
  nomesin: string;
  dealer: DealerData;
}

async function verifyCandidates(
  candidates: string[],
): Promise<VerifiedNoMesin | null> {
  for (const candidate of candidates) {
    const dealer = await getDealer(candidate);
    if (dealer != null) {
      return {nomesin: candidate, dealer};
    }
  }
  return null;
}

export default function ScanStep3Screen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto3, setNomesin, setDealer, state} = useScan();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const [phase, setPhase] = useState<Phase>('camera');
  const [displayedResult, setDisplayedResult] = useState('');
  const [fullResult, setFullResult] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, []);

  const startTypewriter = useCallback((text: string) => {
    setDisplayedResult('');
    setFullResult(text);
    let i = 0;
    typewriterRef.current = setInterval(() => {
      i += 1;
      if (i <= text.length) {
        setDisplayedResult(text.slice(0, i));
      } else {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current);
        }
      }
    }, TYPEWRITER_SPEED_MS);
  }, []);

  const acceptNoMesin = useCallback(
    (verified: VerifiedNoMesin) => {
      setNomesin(verified.nomesin);
      setDealer(verified.dealer);
      setDealerName(verified.dealer.nm_dealer);
      haptic('success');
      playSound('success');
      startTypewriter(verified.nomesin);
      setPhase('result');
      nextTimerRef.current = setTimeout(() => {
        if (route.params?.returnToReview) {
          navigation.navigate('ScanReview');
          return;
        }
        navigation.navigate('ScanStep4');
      }, NEXT_STEP_DELAY_MS);
    },
    [navigation, route.params, playSound, haptic, setDealer, setNomesin, startTypewriter],
  );

  const failToManual = useCallback(
    (message: string, suggestion: string) => {
      setErrorText(message);
      setManualInput(suggestion);
      haptic('error');
      playSound('error');
      setPhase('error');
    },
    [playSound, haptic],
  );

  const handleCapture = useCallback(
    async (img: ScanImage, layout?: {width: number; height: number}) => {
      haptic('capture');
      setPhase('processing');
      setPhoto3(img);
      scanQueue.enqueue({
        step: 3,
        rawUri: img.uri,
        filename: 'hal3.jpg',
        viewWidth: layout?.width,
        viewHeight: layout?.height,
        onDone: setPhoto3,
      });

      let candidates: string[] = [];
      try {
        const recognized = await TextRecognition.recognize(img.uri);
        candidates = extractNoMesinCandidates(recognized);
      } catch {
        failToManual('Gagal membaca teks dari foto.', '');
        return;
      }

      if (candidates.length === 0) {
        failToManual('Tidak ada teks mirip No Mesin di foto.', '');
        return;
      }

      try {
        const verified = await verifyCandidates(candidates);
        if (verified != null) {
          acceptNoMesin(verified);
        } else {
          failToManual(
            'No Mesin terbaca tapi tidak ada di database.',
            candidates[0]!,
          );
        }
      } catch {
        failToManual('Gagal menghubungi server.', candidates[0]!);
      }
    },
    [acceptNoMesin, failToManual, setPhoto3, haptic],
  );

  const handleManualSubmit = useCallback(async () => {
    const trimmed = normalizeNoMesin(manualInput);
    if (!trimmed) {
      return;
    }

    setPhase('processing');
    try {
      const dealer = await getDealer(trimmed);
      if (dealer != null) {
        acceptNoMesin({nomesin: trimmed, dealer});
      } else {
        failToManual('No Mesin tidak ditemukan di database.', trimmed);
      }
    } catch {
      failToManual('Gagal menghubungi server.', trimmed);
    }
  }, [acceptNoMesin, failToManual, manualInput]);

  const handleRetake = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
    }
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    setDisplayedResult('');
    setFullResult('');
    setDealerName('');
    setManualInput('');
    setErrorText('');
    setPhase('camera');
  }, []);

  useHardwareKey(handleRetake, phase === 'error', 'volumeDown');
  useHardwareKey(handleRetake, phase === 'result', 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + Spacing.sm}]}>
      <ScanStepIndicator currentStep={3} totalSteps={5} />

      {phase === 'result' && state.dealer ? (
        <ScanTopDealerAlert
          dealerName={state.dealer.nm_dealer}
          paymentType={state.dealer.payment_type}
        />
      ) : null}

      <View style={styles.cameraArea}>
        <PedalCamera
          filename="hal3.jpg"
          onCapture={handleCapture}
          overlayVariant="document"
          isActive={phase === 'camera' || phase === 'error'}
        />
      </View>

      {phase === 'error' && (
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Perbaiki No Mesin:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: JMF2E1774885"
              placeholderTextColor={Colors.border}
              value={manualInput}
              onChangeText={setManualInput}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ThumbnailStrip currentStep={3} />

      <FloatingToast
        visible={phase === 'processing'}
        type="info"
        message="Mencocokkan No Mesin..."
        subMessage="Memvalidasi ke database dealer"
        onClose={() => {}}
        duration={3000}
      />

      <ScanFeedback
        type="result"
        message={displayedResult || fullResult}
        subMessage={dealerName ? `Dealer: ${dealerName}` : undefined}
        visible={phase === 'result'}
      />

      <FloatingToast
        visible={phase === 'error'}
        type="error"
        message={errorText || 'Gagal Membaca No Mesin'}
        subMessage="Silakan masukkan nomor mesin manual di bawah"
        onClose={() => {}}
        duration={4000}
      />
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
  manualSection: {
    marginBottom: Spacing.md,
  },
  manualLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  submitBtnText: {
    ...Typography.label,
    fontSize: 16,
    color: Colors.textOnAccent,
    fontFamily: 'Inter-SemiBold',
  },
});