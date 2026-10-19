import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {TooltipProps} from 'rn-tourguide';
import {Colors, Spacing, Radius} from '../constants';

export default function TourTooltip({
  isFirstStep,
  isLastStep,
  currentStep,
  handleNext,
  handlePrev,
  handleStop,
}: TooltipProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>
            Langkah {currentStep?.order ?? 1}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleStop}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.bodyText}>
        {currentStep?.text ?? ''}
      </Text>

      <View style={styles.footerRow}>
        {!isFirstStep && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePrev}
            activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Sebelumnya</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isFirstStep && styles.primaryButtonFull]}
          onPress={isLastStep ? handleStop : handleNext}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>
            {isLastStep ? 'Selesai' : 'Lanjut'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: 280,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgePill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  closeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  bodyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textHeadline,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  primaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  primaryButtonFull: {
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: Colors.white,
  },
});
