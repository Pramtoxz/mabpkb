import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
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
import LottieView from 'lottie-react-native';
import {Colors, Typography, Spacing, Radius} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useTabNav} from '../../contexts/TabNavContext';
import {useAlert} from '../../contexts/AlertContext';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import {useHardwareKey} from '../../hooks/useHardwareKey';
import {processBpkb} from '../../api';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import ThumbnailStrip from '../../components/ThumbnailStrip';
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
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [hintExpanded, setHintExpanded] = useState(true);
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
        haptic('error');
        playSound('error');
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

        haptic('submit');
        playSound('submit');
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
        haptic('error');
        playSound('error');
        setPhase('submitError');
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [navigation, playSound, haptic, resetScan, setActiveTab, setPendingTrackId, showAlert, state],
  );

  const acceptNobpkb = useCallback(
    (value: string) => {
      setNobpkb(value);
      setResultText(value);
      haptic('detect');
      playSound('beep');
      setPhase('confirm');
    },
    [playSound, haptic, setNobpkb],
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
    <View style={[styles.container, {paddingBottom: Spacing.xxl + insets.bottom}]}>
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
            <CheckIcon size={48} color={Colors.success} />
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
            <LottieView
              source={require('../../assets/lottie/business.json')}
              autoPlay
              loop
              style={styles.lottieRocket}
            />
            <Text style={styles.processingText}>Cuuusss Terbang...</Text>
          </View>
        )}
        {phase === 'submitError' && (
          <View style={styles.errorCard}>
            <XIcon size={48} color={Colors.error} />
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

      <ThumbnailStrip currentStep={5} />

      <TouchableOpacity
        style={styles.hintCard}
        onPress={() => setHintExpanded(h => !h)}
        activeOpacity={0.8}>
        <View style={styles.hintHeader}>
          <Text style={styles.hintTitle} numberOfLines={1}>
            Barcode
          </Text>
          <Text style={styles.hintChevron}>{hintExpanded ? '▾' : '▸'}</Text>
        </View>
        {hintExpanded && (
          <Text style={styles.hintDesc}>
            {phase === 'scanning'
              ? 'Arahkan kamera ke barcode BPKB'
              : phase === 'confirm'
              ? 'Tekan pedal untuk KIRIM, Volume Atas untuk ulang'
              : phase === 'submitError'
              ? 'Tekan pedal untuk kirim ulang, Volume Atas untuk ulang scan'
              : 'Memproses...'}
          </Text>
        )}
      </TouchableOpacity>
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
  processingCard: {
    flex: 1,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    gap: 12,
  },
  lottieRocket: {
    width: 120,
    height: 120,
  },
  processingText: {
    ...Typography.h3,
    color: Colors.accent,
  },
  doneCard: {
    flex: 1,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.success,
    gap: 8,
    paddingHorizontal: 16,
  },
  resultValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 24,
    lineHeight: 32,
    color: Colors.success,
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    gap: 2,
  },
  summaryLine: {
    ...Typography.bodySmall,
    color: Colors.success,
    textAlign: 'center',
  },
  errorCard: {
    flex: 1,
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.error,
    textAlign: 'center',
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
  hintCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintTitle: {
    ...Typography.label,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  hintChevron: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  hintDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'left',
  },
});