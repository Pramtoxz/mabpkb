import React, {useCallback, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  AppState,
  AppStateStatus,
} from 'react-native';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ScanStackParamList} from '../../navigation/types';
import {Colors, Typography, Spacing, Radius} from '../../constants';
import {useScan} from '../../contexts/ScanContext';
import {useSound} from '../../hooks/useSound';
import {useHaptic} from '../../hooks/useHaptic';
import ScanStepIndicator from '../../components/ScanStepIndicator';
import ScanTopDealerAlert from '../../components/ScanTopDealerAlert';
import ThumbnailStrip from '../../components/ThumbnailStrip';
import DocumentOverlay from '../../components/DocumentOverlay';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanStep5'>;

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
  const {state, setNobpkb} = useScan();
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [manualInput, setManualInput] = useState('');
  const hasScannedRef = useRef(false);
  const isFocused = useIsFocused();
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === 'active',
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      setIsForeground(status === 'active');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isFocused) {
      hasScannedRef.current = false;
      setManualInput('');
    }
  }, [isFocused]);

  const isCameraActive = isFocused && isForeground;
  const handleCameraError = useCallback((_error: CameraRuntimeError) => {}, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const acceptNobpkb = useCallback(
    (value: string) => {
      setNobpkb(value);
      haptic('detect');
      playSound('beep');
      hasScannedRef.current = false;
      navigation.navigate('ScanReview');
    },
    [haptic, navigation, playSound, setNobpkb],
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

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + Spacing.sm}]}>
      <ScanStepIndicator currentStep={5} totalSteps={5} />

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

      <View style={styles.cameraArea}>
        {hasPermission && device != null && (
          <View style={StyleSheet.absoluteFill}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isCameraActive}
              codeScanner={codeScanner}
              androidPreviewViewType="texture-view"
              outputOrientation="preview"
              onError={handleCameraError}
            />
            <DocumentOverlay variant="barcode" />
          </View>
        )}
      </View>

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

      <ThumbnailStrip currentStep={5} />
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
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  submitBtnText: {
    ...Typography.label,
    fontSize: 16,
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
  },
});