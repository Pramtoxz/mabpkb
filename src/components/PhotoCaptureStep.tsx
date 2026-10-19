import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing, Radius} from '../constants';
import {useScan, type ScanImage} from '../contexts/ScanContext';
import {useHardwareKey} from '../hooks/useHardwareKey';
import {useHaptic} from '../hooks/useHaptic';
import {useSound} from '../hooks/useSound';
import {CheckIcon} from './TabIcons';
import PedalCamera from './PedalCamera';
import ScanStepIndicator from './ScanStepIndicator';
import ThumbnailStrip from './ThumbnailStrip';
import ScanTopDealerAlert from './ScanTopDealerAlert';

const NEXT_STEP_DELAY_MS = 1000;

type Phase = 'camera' | 'done';

interface PhotoCaptureStepProps {
  step: number;
  totalSteps: number;
  title: string;
  filename: string;
  onCaptured: (img: ScanImage) => void;
  onNext: () => void;
}

export default function PhotoCaptureStep({
  step,
  totalSteps,
  title,
  filename,
  onCaptured,
  onNext,
}: PhotoCaptureStepProps) {
  const insets = useSafeAreaInsets();
  const {state} = useScan();
  const [phase, setPhase] = useState<Phase>('camera');
  const [hintExpanded, setHintExpanded] = useState(true);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {trigger: haptic} = useHaptic();
  const {play: playSound} = useSound();

  const handleCapture = useCallback(
    (img: ScanImage) => {
      haptic('capture');
      playSound('tick');
      onCaptured(img);
      setPhase('done');
      nextTimerRef.current = setTimeout(onNext, NEXT_STEP_DELAY_MS);
    },
    [onCaptured, onNext, haptic, playSound],
  );

  const handleRetake = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
    }
    setPhase('camera');
  }, []);

  useHardwareKey(handleRetake, phase === 'done', 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: Spacing.xxl + insets.bottom}]}>
      <ScanStepIndicator currentStep={step} totalSteps={totalSteps} />

      {state.dealer ? (
        <ScanTopDealerAlert
          dealerName={state.dealer.nm_dealer}
          paymentType={state.dealer.payment_type}
        />
      ) : null}

      <View style={styles.cameraArea}>
        <PedalCamera
          filename={filename}
          onCapture={handleCapture}
          isActive={phase === 'camera'}
        />
        {phase === 'done' && (
          <View style={[StyleSheet.absoluteFill, styles.doneCard]}>
            <CheckIcon size={56} color={Colors.success} />
            <Text style={styles.doneText}>Foto {step} tersimpan</Text>
          </View>
        )}
      </View>

      <ThumbnailStrip currentStep={step} />

      <TouchableOpacity
        style={styles.hintCard}
        onPress={() => setHintExpanded(h => !h)}
        activeOpacity={0.8}>
        <View style={styles.hintHeader}>
          <Text style={styles.hintTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.hintChevron}>{hintExpanded ? '▾' : '▸'}</Text>
        </View>
        {hintExpanded && (
          <Text style={styles.hintDesc}>
            {phase === 'done'
              ? 'Tekan Volume Atas untuk ulang'
              : 'Tekan pedal untuk foto'}
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
  doneCard: {
    flex: 1,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.success,
    gap: 8,
  },
  doneText: {
    ...Typography.h3,
    color: Colors.success,
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