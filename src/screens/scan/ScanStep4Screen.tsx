import React, {useCallback, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {CheckIcon, XIcon} from '../../components/TabIcons';
import {getDealer, type DealerData} from '../../api';
import {
  extractNoMesinCandidates,
  normalizeNoMesin,
} from '../../utils/noMesin';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import ScanFeedback from '../../components/ScanFeedback';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep4'>;
type Phase = 'camera' | 'processing' | 'result' | 'error';

const NEXT_STEP_DELAY_MS = 2000;

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

export default function ScanStep4Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto4, setNomesin, setDealer} = useScan();
  const {play} = useSound();
  const [phase, setPhase] = useState<Phase>('camera');
  const [resultText, setResultText] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const acceptNoMesin = useCallback(
    (verified: VerifiedNoMesin) => {
      setNomesin(verified.nomesin);
      setDealer(verified.dealer);
      setResultText(verified.nomesin);
      setDealerName(verified.dealer.nm_dealer);
      play('success');
      setPhase('result');
      nextTimerRef.current = setTimeout(
        () => navigation.navigate('ScanStep5'),
        NEXT_STEP_DELAY_MS,
      );
    },
    [navigation, play, setDealer, setNomesin],
  );

  const failToManual = useCallback(
    (message: string, suggestion: string) => {
      setErrorText(message);
      setManualInput(suggestion);
      play('error');
      setPhase('error');
    },
    [play],
  );

  const handleCapture = useCallback(
    async (img: ScanImage) => {
      setPhase('processing');
      setPhoto4(img);

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
    [acceptNoMesin, failToManual, setPhoto4],
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
    setResultText('');
    setDealerName('');
    setManualInput('');
    setErrorText('');
    setPhase('camera');
  }, []);

  useHardwareKey(handleRetake, phase === 'error', 'volumeDown');
  useHardwareKey(handleRetake, phase === 'result', 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={4} totalSteps={5} />

      <View style={styles.cameraArea}>
        {phase === 'camera' && (
          <PedalCamera filename="nomesin.jpg" onCapture={handleCapture} />
        )}
        {phase === 'processing' && (
          <View style={styles.processingCard}>
            <Text style={styles.processingText}>Mencocokkan No Mesin...</Text>
          </View>
        )}
        {phase === 'result' && (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.resultValue}>{resultText}</Text>
            <Text style={styles.dealerName}>{dealerName}</Text>
          </View>
        )}
        {phase === 'error' && (
          <View style={styles.errorCard}>
            <XIcon size={56} color={Colors.destructive} />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}
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

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Foto No Mesin</Text>
        <Text style={styles.hintDesc}>
          {phase === 'camera'
            ? 'Tekan pedal (Volume Bawah) untuk foto'
            : phase === 'error'
            ? 'Tekan pedal untuk foto ulang, atau perbaiki manual lalu OK'
            : 'Memproses...'}
        </Text>
      </View>

      <ScanFeedback
        type="result"
        message={resultText}
        visible={phase === 'result'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  cameraArea: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  processingCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  processingText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.primary,
  },
  doneCard: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
    gap: 8,
  },
  resultValue: {
    fontFamily: Fonts.heading.bold,
    fontSize: 28,
    color: '#16a34a',
  },
  dealerName: {
    fontFamily: Fonts.body.medium,
    fontSize: 15,
    color: '#15803d',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  errorCard: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.destructive,
    gap: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.destructive,
    textAlign: 'center',
  },
  manualSection: {
    marginBottom: 12,
  },
  manualLabel: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    color: Colors.neutral,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body.regular,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.neutral,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
  hintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 2,
  },
  hintDesc: {
    fontFamily: Fonts.body.regular,
    fontSize: 13,
    color: Colors.neutral,
    opacity: 0.6,
    textAlign: 'center',
  },
});
