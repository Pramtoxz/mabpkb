import React, {useCallback, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useAlert} from '../../contexts/AlertContext';
import {showErrorToast} from '../../utils/toast';
import {useSound} from '../../hooks/useSound';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {processBpkb} from '../../api';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import {CheckIcon, XIcon} from '../../components/TabIcons';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep5'>;
type Phase = 'camera' | 'scanning' | 'result' | 'error' | 'confirm' | 'submitting';

const DOUBLE_PRESS_WINDOW = 3000;

export default function ScanStep5Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {state, setNobpkb, resetScan} = useScan();
  const {showAlert} = useAlert();
  const {play} = useSound();
  const [phase, setPhase] = useState<Phase>('camera');
  const [resultText, setResultText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [, setPressCount] = useState(0);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSubmit = useCallback(async () => {
    if (!state.photo1 || !state.photo2 || !state.photo3 || !state.photo4) {
      showErrorToast('Foto belum lengkap.');
      return;
    }
    if (!state.nobpkb) {
      showErrorToast('No BPKB belum diisi.');
      return;
    }

    setPhase('submitting');
    try {
      const result = await processBpkb(state.nomesin, state.nobpkb, [
        state.photo1, state.photo2, state.photo3, state.photo4,
      ]);

      play('submit');
      showAlert({
        title: 'Berhasil',
        message: `BPKB sedang diproses.\nTrack ID: ${result.track_id}`,
        type: 'success',
        confirmText: 'Lacak Status',
        cancelText: 'Scan Lagi',
        onConfirm: () => {
          resetScan();
          navigation.getParent()?.navigate('BatchTab', {screen: 'TrackStatus', params: {trackId: result.track_id}});
        },
        onCancel: () => {
          resetScan();
          navigation.getParent()?.navigate('ScanTab', {screen: 'ScanStep1'});
        },
      });
      setPhase('result');
    } catch (error: any) {
      const message = error?.data?.errors
        ? Object.values(error.data.errors).flat().join('\n')
        : error?.data?.message || 'Terjadi kesalahan.';
      play('error');
      showErrorToast(message);
      setPhase('error');
    }
  }, [navigation, play, resetScan, showAlert, state]);

  const handleDoublePress = useCallback(() => {
    setPressCount(prev => {
      const next = prev + 1;
      if (next === 1) {
        setPhase('confirm');
        if (confirmTimerRef.current) {clearTimeout(confirmTimerRef.current);}
        confirmTimerRef.current = setTimeout(() => {
          setPressCount(0);
          setPhase('result');
        }, DOUBLE_PRESS_WINDOW);
      }
      if (next >= 2) {
        if (confirmTimerRef.current) {clearTimeout(confirmTimerRef.current);}
        setPressCount(0);
        doSubmit();
      }
      return next;
    });
  }, [doSubmit]);

  const handleCapture = useCallback(async (img: ScanImage) => {
    setPhase('scanning');

    try {
      const barcodes = await BarcodeScanning.scan(img.uri);

      if (barcodes.length > 0) {
        const barcodeValue = barcodes[0].value || '';
        setNobpkb(barcodeValue);
        setResultText(barcodeValue);
        play('success');
        setPhase('result');
        pressTimerRef.current = setTimeout(() => handleDoublePress(), 1500);
      } else {
        play('error');
        setPhase('error');
      }
    } catch {
      play('error');
      setPhase('error');
    }
  }, [handleDoublePress, play, setNobpkb]);

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualInput.trim();
    if (!trimmed) {return;}
    setNobpkb(trimmed);
    setResultText(trimmed);
    play('success');
    setPhase('result');
    pressTimerRef.current = setTimeout(() => handleDoublePress(), 1000);
  }, [handleDoublePress, manualInput, play, setNobpkb]);

  const handleRetake = useCallback(() => {
    if (pressTimerRef.current) {clearTimeout(pressTimerRef.current);}
    if (confirmTimerRef.current) {clearTimeout(confirmTimerRef.current);}
    setPressCount(0);
    setResultText('');
    setManualInput('');
    setPhase('camera');
  }, []);

  useHardwareKey(
    handleRetake,
    phase === 'result' || phase === 'error' || phase === 'confirm',
    'volumeUp',
  );

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={5} totalSteps={5} />

      <View style={styles.cameraArea}>
        {phase === 'camera' && (
          <PedalCamera filename="barcode.jpg" onCapture={handleCapture} overlayVariant="barcode" />
        )}
        {phase === 'scanning' && (
          <View style={styles.processingCard}>
            <Text style={styles.processingText}>Memindai barcode...</Text>
          </View>
        )}
        {(phase === 'result' || phase === 'confirm') && (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.resultValue}>{resultText}</Text>
          </View>
        )}
        {phase === 'error' && (
          <View style={styles.errorCard}>
            <XIcon size={56} color={Colors.destructive} />
            <Text style={styles.errorText}>Barcode tidak terdeteksi</Text>
          </View>
        )}
        {phase === 'submitting' && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Mengirim...</Text>
          </View>
        )}
      </View>

      {phase === 'confirm' && (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmText}>Tekan sekali lagi untuk kirim</Text>
        </View>
      )}

      {phase === 'error' && (
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Masukkan No BPKB manual:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: BPKB-2026-001"
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
        <Text style={styles.hintTitle}>Foto Barcode BPKB</Text>
        <Text style={styles.hintDesc}>
          {phase === 'camera' ? 'Tekan pedal (Volume Bawah) untuk foto' :
           phase === 'confirm' ? 'Tekan pedal sekali lagi untuk kirim' :
           phase === 'error' ? 'Tekan Volume Atas untuk ulang' :
           'Memproses...'}
        </Text>
      </View>
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
    gap: 12,
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
    fontSize: 24,
    color: '#16a34a',
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
  },
  errorText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 16,
    color: Colors.destructive,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  confirmCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 12,
  },
  confirmText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: '#92400e',
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
