import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Radius, Spacing} from '../constants';

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

export default function ScanStepIndicator({
  currentStep,
  totalSteps,
}: ScanStepIndicatorProps) {
  const insets = useSafeAreaInsets();
  const label = STEP_LABELS[currentStep - 1] ?? '';

  return (
    <View style={[styles.container, {paddingTop: Math.max(insets.top, 10)}]}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            LANGKAH {currentStep} / {totalSteps}
          </Text>
        </View>

        <Text style={styles.stepTitle} numberOfLines={1}>
          {label}
        </Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: Colors.textHeadline,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  segment: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
  },
  segmentGap: {
    width: 4,
  },
  segmentDone: {
    backgroundColor: Colors.primary,
  },
  segmentActive: {
    backgroundColor: Colors.emeraldMint,
    shadowColor: Colors.emeraldMint,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
});