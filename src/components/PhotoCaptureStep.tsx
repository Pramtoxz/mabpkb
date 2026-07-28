import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Fonts} from '../constants';
import type {ScanImage} from '../contexts/ScanContext';
import {useHardwareKey} from '../hooks/useHardwareKey';
import {CheckIcon} from './TabIcons';
import PedalCamera from './PedalCamera';
import ScanStepIndicator from './ScanStepIndicator';

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
  const [phase, setPhase] = useState<Phase>('camera');
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCapture = useCallback(
    (img: ScanImage) => {
      onCaptured(img);
      setPhase('done');
      nextTimerRef.current = setTimeout(onNext, NEXT_STEP_DELAY_MS);
    },
    [onCaptured, onNext],
  );

  const handleRetake = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
    }
    setPhase('camera');
  }, []);

  useHardwareKey(handleRetake, phase === 'done', 'volumeUp');

  return (
    <View style={[styles.container, {paddingBottom: 24 + insets.bottom}]}>
      <ScanStepIndicator currentStep={step} totalSteps={totalSteps} />

      <View style={styles.cameraArea}>
        {phase === 'camera' ? (
          <PedalCamera filename={filename} onCapture={handleCapture} />
        ) : (
          <View style={styles.doneCard}>
            <CheckIcon size={56} color="#16a34a" />
            <Text style={styles.doneText}>Foto {step} tersimpan</Text>
          </View>
        )}
      </View>

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>{title}</Text>
        <Text style={styles.hintDesc}>
          {phase === 'done'
            ? 'Tekan Volume Atas untuk ulang'
            : 'Tekan pedal (Volume Bawah) untuk foto'}
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
    marginBottom: 16,
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
  doneText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 18,
    color: '#16a34a',
  },
  hintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintTitle: {
    fontFamily: Fonts.heading.bold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 4,
  },
  hintDesc: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.6,
    textAlign: 'center',
  },
});
