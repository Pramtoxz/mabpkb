import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckIcon} from './TabIcons';
import {Colors, Typography} from '../constants';

const STEP_LABELS = [
  'Identitas Pemilik',
  'Identitas Kendaraan',
  'Identitas Lanjutan',
  'Dokumen Persyaratan',
  'Barcode BPKB',
];

interface ScanStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ScanStepIndicator({currentStep, totalSteps}: ScanStepIndicatorProps) {
  const insets = useSafeAreaInsets();
  const label = STEP_LABELS[currentStep - 1] ?? '';

  return (
    <View style={[styles.container, {paddingTop: insets.top + 12}]}>
      <Text style={styles.stepLabel} numberOfLines={1}>
        STEP {currentStep} · {label}
      </Text>

      <View style={styles.bar}>
        {Array.from({length: totalSteps}, (_, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              {i > 0 && <View style={styles.segmentGap} />}
              <View
                style={[
                  styles.segment,
                  isDone && styles.segmentDone,
                  isActive && styles.segmentActive,
                ]}
              />
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.checkRow}>
        {Array.from({length: totalSteps}, (_, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;

          return (
            <View key={step} style={styles.checkSlot}>
              {isDone ? (
                <CheckIcon size={14} color={Colors.accent} />
              ) : (
                <View
                  style={[
                    styles.checkDot,
                    isActive && styles.checkDotActive,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  stepLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  bar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
  },
  segmentGap: {
    width: 4,
  },
  segmentDone: {
    backgroundColor: Colors.accent,
  },
  segmentActive: {
    backgroundColor: Colors.accent,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  checkSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
  },
  checkDotActive: {
    backgroundColor: Colors.accent,
  },
});