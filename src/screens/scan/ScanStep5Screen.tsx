import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Fonts} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useTabNav} from '../../contexts/TabNavContext';
import {useAlert} from '../../contexts/AlertContext';
import {useSound} from '../../hooks/useSound';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {processBpkb} from '../../api';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import DocumentOverlay from '../../components/DocumentOverlay';
import {CheckIcon, XIcon} from '../../components/TabIcons';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep5'>;
type Phase = 'scanning' | 'confirm' | 'submitting' | 'submitError';

const CODE_TYPES = [
  'qr',
  'code-128',
  'code-39',
  'ean-13',
  'pdf-417',
  'data-matrix',
  'aztec',
] as const;

export default function ScanStep5Screen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {state, setNobpkb, resetScan} = useScan();
  const {setActiveTab, setPendingTrackId} = useTabNav();
  const {showAlert} = useAlert();
  const {play} = useSound();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [resultText, setResultText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const isSubmittingRef = useRef(false);
  const hasScannedRef = useRef(false);

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

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
            setPendingTrackId(result.track_id);
            resetScan();
            setPhase('scanning');
            setActiveTab(2);
          },
          onCancel: () => {
            resetScan();
            setPhase('scanning');
            navigation.navigate('ScanStep1');
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
    [navigation, play, resetScan, setActiveTab, setPendingTrackId, showAlert, state],
  );

  const acceptNobpkb = useCallback(
    (value: string) => {
      setNobpkb(value);
      setResultText(value);
      play('success');
      setPhase('confirm');
    },
    [play, setNobpkb],
  );

  const codeScanner = useCodeScanner({
    codeTypes: [...CODE_TYPES],
    onCodeScanned: codes => {
      if (hasScannedRef.current) {
        return;
      }
      const value = codes[0]?.value;
      if (!value) {
        return;
      }
      hasScannedRef.current = true;
      acceptNobpkb(value);
    },
  });

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      return;
    }
    hasScannedRef.current = true;
    acceptNobpkb(trimmed);
  }, [acceptNobpkb, manualInput]);

  const handleRetake = useCallback(() => {
    hasScannedRef.current = false;
    setResultText('');
    setManualInput('');
    setErrorText('');
    setPhase('scanning');
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
        {phase === 'scanning' && hasPermission && device != null && (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={phase === 'scanning'}
              codeScanner={codeScanner}
            />
            <DocumentOverlay variant="barcode" />
          </>
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
        {phase === 'submitError' && (
          <View style={styles.errorCard}>
            <XIcon size={48} color={Colors.destructive} />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}
      </View>

      {phase === 'scanning' && (
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Atau masukkan No BPKB manual:</Text>
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
        <Text style={styles.hintTitle}>Barcode</Text>
        <Text style={styles.hintDesc}>
          {phase === 'scanning'
            ? 'Arahkan kamera ke barcode BPKB'
            : phase === 'confirm'
            ? 'Tekan pedal untuk KIRIM, Volume Atas untuk ulang'
            : phase === 'submitError'
            ? 'Tekan pedal untuk kirim ulang, Volume Atas untuk ulang scan'
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
