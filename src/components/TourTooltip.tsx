import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import type {TooltipProps} from 'rn-tourguide';
import {Colors, Spacing, Radius, getRandomOtherMascot} from '../constants';
import {markTourSeen} from '../utils/storage';

export default function TourTooltip({
  isFirstStep,
  isLastStep,
  currentStep,
  handleNext,
  handlePrev,
  handleStop,
}: TooltipProps) {
  const mascotSource = useMemo(() => getRandomOtherMascot(), []);
  const stepOrder = currentStep?.order ?? 1;

  const handleDismiss = () => {
    markTourSeen('home');
    handleStop?.();
  };

  return (
    <View style={styles.card}>

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Image
            source={mascotSource}
            style={styles.mascotAvatar}
            resizeMode="cover"
          />
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Langkah {stepOrder}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          activeOpacity={0.7}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          accessibilityRole="button"
          accessibilityLabel="Lewati Panduan">
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
            activeOpacity={0.8}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityRole="button"
            accessibilityLabel="Langkah Sebelumnya">
            <Text style={styles.secondaryButtonText}>Sebelumnya</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isFirstStep && styles.primaryButtonFull]}
          onPress={isLastStep ? handleDismiss : handleNext}
          activeOpacity={0.85}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityRole="button"
          accessibilityLabel={isLastStep ? 'Selesai Panduan' : 'Lanjut Panduan'}>
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
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: 290,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  progressBar: {
    display: 'none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mascotAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  stepBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  stepBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  closeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  bodyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.textHeadline,
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  primaryButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonFull: {
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: Colors.white,
  },
});
