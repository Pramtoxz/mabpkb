import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {CheckIcon, XIcon} from '../../components/TabIcons';
import {getDealer} from '../../api';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import ScanFeedback from '../../components/ScanFeedback';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep3'>;

const NO_MESIN_REGEX = /[A-Z0-9]{8,16}/;

export default function ScanStep3Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {setPhoto3, setNomesin, setDealer} = useScan();
  const {play} = useSound();
  const [phase, setPhase] = useState<'camera' | 'ocr' | 'result' | 'error'>('camera');
  const [resultText, setResultText] = useState('');
  const [manualInput, setManualInput] = useState('');

  const handleCapture = useCallback(async (img: ScanImage) => {
    setPhoto3(img);
    setPhase('ocr');

    try {
      const result = await TextRecognition.recognize(img.uri);
      const match = result.text.match(NO_MESIN_REGEX);

      if (match) {
        const nomesin = match[0];
        setNomesin(nomesin);
        setResultText(nomesin);
        play('success');
        setPhase('result');

        try {
          const dealer = await getDealer(nomesin);
          if (dealer) {setDealer(dealer);}
        } catch {}

        setTimeout(() => navigation.navigate('ScanStep4'), 2000);
      } else {
        play('error');
        setPhase('error');
      }
    } catch {
      play('error');
      setPhase('error');
    }
  }, [navigation, play, setDealer, setNomesin, setPhoto3]);

  const handleManualSubmit = useCallback(async () => {
    const trimmed = manualInput.trim().toUpperCase();
    if (!trimmed) {return;}
    setNomesin(trimmed);
    setResultText(trimmed);
    play('success');
    setPhase('result');

    try {
      const dealer = await getDealer(trimmed);
      if (dealer) {setDealer(dealer);}
    } catch {}

    setTimeout(() => navigation.navigate('ScanStep4'), 1500);
  }, [manualInput, navigation, play, setDealer, setNomesin]);

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={3} totalSteps={4} />

      <View style={styles.cameraArea}>
        {phase === 'camera' && (
          <PedalCamera filename="hal3.jpg" onCapture={handleCapture} />
        )}
        {phase === 'ocr' && (
          <View style={styles.processingCard}>
            <Text style={styles.processingText}>Memproses OCR...</Text>
          </View>
        )}
        {phase === 'result' && (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.resultValue}>{resultText}</Text>
          </View>
        )}
        {phase === 'error' && (
          <View style={styles.errorCard}>
            <XIcon size={56} color={Colors.destructive} />
            <Text style={styles.errorText}>OCR gagal</Text>
          </View>
        )}
      </View>

      {phase === 'error' && (
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Masukkan No Mesin manual:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: JFP1E2714484"
              placeholderTextColor={Colors.border}
              value={manualInput}
              onChangeText={setManualInput}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.submitBtn}>
              <Text style={styles.submitBtnText} onPress={handleManualSubmit}>OK</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Foto No Mesin</Text>
        <Text style={styles.hintDesc}>
          {phase === 'camera' ? 'Tekan tombol Volume Up atau pedal untuk foto' : 'Memproses...'}
        </Text>
      </View>

      <ScanFeedback
        type={phase === 'error' ? 'error' : 'result'}
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
  errorCard: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.destructive,
    gap: 8,
  },
  errorText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: Colors.destructive,
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
