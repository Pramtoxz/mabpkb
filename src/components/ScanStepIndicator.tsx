import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CheckIcon} from './TabIcons';
import {Colors, Fonts} from '../constants';

interface ScanStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ScanStepIndicator({currentStep, totalSteps}: ScanStepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({length: totalSteps}, (_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            {i > 0 && <View style={[styles.line, isDone && styles.lineDone]} />}
            <View style={[styles.dot, isDone && styles.dotDone, isActive && styles.dotActive]}>
              {isDone ? (
                <CheckIcon size={16} color="#FFFFFF" />
              ) : (
                <Text style={[styles.dotText, isActive && styles.dotTextActive]}>{step}</Text>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 0,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dotText: {
    fontFamily: Fonts.heading.semiBold,
    fontSize: 14,
    color: Colors.neutral,
    opacity: 0.4,
  },
  dotTextActive: {
    color: '#FFFFFF',
    opacity: 1,
  },
  line: {
    width: 32,
    height: 2,
    backgroundColor: Colors.border,
  },
  lineDone: {
    backgroundColor: '#16a34a',
  },
});
