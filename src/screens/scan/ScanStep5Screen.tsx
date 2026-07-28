import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan, type ScanImage} from '../../contexts/ScanContext';
import {useAlert} from '../../contexts/AlertContext';
import {useSound} from '../../hooks/useSound';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {processBpkb} from '../../api';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import PedalCamera from '../../components/PedalCamera';
import {CheckIcon, XIcon} from '../../components/TabIcons';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep5'>;
type Phase =
  | 'camera'
  | 'scanning'
  | 'confirm'
  | 'submitting'
  | 'scanError'
  | 'submitError';

export default function ScanStep5Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {state, setNobpkb, resetScan} = useScan();
  const {showAlert} = useAlert();
  const {play} = useSound();
  const [phase, setPhase] = useState<Phase>('camera');
  const [resultText, setResultText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const isSubmittingRef = useRef(false);

  const doSubmit = useCallback(
    async (nobpkb: string) => {
      if (isSubmittingRef.current) {
        return;
      }
      if (!state.photo1 || !state.photo2 || !state.photo3 || !state.photo4) {
        setErrorText('Foto belum lengkap. Ulangi scan dari awal.');
        play('error');
        setPhase('submitError');
        return;
      }

      isSubmittingRef.current = true;
      setPhase('submitting');
      try {
        const result = await processBpkb(state.nomesin, nobpkb, [
          state.photo1,
          state.photo2,
          state.photo3,
          state.photo4,
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
            navigation.getParent()?.navigate('BatchTab', {
              screen: 'TrackStatus',
              params: {trackId: result.track_id},
            });
          },
          onCancel: () => {
            resetScan();
            navigation.getParent()?.navigate('ScanTab', {screen: 'ScanStep1'});
          },
        });
      } catch (error: any) {
        const message = error?.data?.errors
          ? Object.values(error.data.errors).flat().join('\n')
          : error?.data?.message || 'Gagal mengirim ke server.';
        setErrorText(message);
        play('error');
        setPhase('submitError');
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [navigation, play, resetScan, showAlert, state],
  );

  const handleCapture = useCallback(
    async (img: ScanImage) => {
      setPhase('scanning');

      try {
        const barcodes = await BarcodeScanning.scan(img.uri);
        const value = barcodes[0]?.value;

        if (value) {
          setNobpkb(value);
          setResultText(value);
          play('success');
          setPhase('confirm');
        } else {
          setErrorText('Barcode tidak terdeteksi');
          play('error');
          setPhase('scanError');
        }
      } catch {
        setErrorText('Gagal memindai barcode');
        play('error');
        setPhase('scanError');
      }
    },
    [play, setNobpkb],
  );

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      return;
    }
    setNobpkb(trimmed);
    setResultText(trimmed);
    play('success');
    setPhase('confirm');
  }, [manualInput, play, setNobpkb]);

  const handleRetake = useCallback(() => {
    setResultText('');
    setManualInput('');
    setErrorText('');
    setPhase('camera');
  }, []);

  const handleSend = useCallback(() => {
    doSubmit(resultText);
  }, [doSubmit, resultText]);

  const handleRetrySubmit = useCallback(() => {
    if (resultText) {
      doSubmit(resultText);
    } else {
      handleRetake();
    }
  }, [doSubmit, handleRetake, resultText]);

  useHardwareKey(handleSend, phase === 'confirm', 'volumeDown');
  useHardwareKey(handleRetake, phase === 'scanError', 'volumeDown');
  useHardwareKey(handleRetrySubmit, phase === 'submitError', 'volumeDown');
  useHardwareKey(
    handleRetake,
    phase === 'confirm' || phase === 'submitError',
    'volumeUp',
  );

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={5} totalSteps={5} />

      <View style={styles.cameraArea}>
        {phase === 'camera' && (
          <PedalCamera
            filename="barcode.jpg"
            onCapture={handleCapture}
            overlayVariant="barcode"
          />
        )}
        {phase === 'scanning' && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Memindai barcode...</Text>
          </View>
        )}
        {phase === 'confirm' && (
          <View style={styles.doneCard}>
            <CheckIcon size={48} color="#16a34a" />
            <Text style={styles.resultValue}>{resultText}</Text>
            <View style={styles.summary}>
              <Text style={styles.summaryLine}>
                No Mesin: {state.nomesin || '-'}
              </Text>
              <Text style={styles.summaryLine}>
                Dealer: {state.dealer?.nm_dealer ?? '-'}
              </Text>
            </View>
          </View>
        )}
        {phase === 'submitting' && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Mengirim...</Text>
          </View>
        )}
        {(phase === 'scanError' || phase === 'submitError') && (
          <View style={styles.errorCard}>
            <XIcon size={48} color={Colors.destructive} />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}
      </View>

      {phase === 'scanError' && (
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
            <Pressable style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Foto Barcode BPKB</Text>
        <Text style={styles.hintDesc}>
          {phase === 'camera'
            ? 'Tekan pedal (Volume Bawah) untuk foto'
            : phase === 'confirm'
            ? 'Tekan pedal untuk KIRIM, Volume Atas untuk ulang'
            : phase === 'scanError'
            ? 'Tekan pedal untuk foto ulang, atau isi manual lalu OK'
            : phase === 'submitError'
            ? 'Tekan pedal untuk kirim ulang, Volume Atas untuk foto ulang'
            : 'Memproses...'}
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
    paddingHorizontal: 16,
  },
  resultValue: {
    fontFamily: Fonts.heading.bold,
    fontSize: 24,
    color: '#16a34a',
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    gap: 2,
  },
  summaryLine: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    color: '#15803d',
    textAlign: 'center',
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
    fontSize: 16,
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
