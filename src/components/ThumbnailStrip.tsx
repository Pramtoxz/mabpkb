import React from 'react';
import {View, Image, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {Colors, Typography} from '../constants';
import {useScan} from '../contexts/ScanContext';

interface ThumbnailStripProps {
  currentStep: number;
  onRetake?: (step: number) => void;
}

const SLOT_LABELS = ['Hal 1', 'Hal 2', 'Hal 3', 'Hal 4'];

export default function ThumbnailStrip({currentStep, onRetake}: ThumbnailStripProps) {
  const {state} = useScan();
  const photos = [state.photo1, state.photo2, state.photo3, state.photo4];

  const handleTap = (step: number) => {
    if (photos[step - 1] && onRetake) {
      onRetake(step);
    }
  };

  return (
    <View style={styles.strip}>
      {photos.map((photo, i) => {
        const step = i + 1;
        const isFilled = !!photo;
        const isActive = step === currentStep;
        const isPast = step < currentStep;

        return (
          <TouchableOpacity
            key={step}
            style={[
              styles.slot,
              isFilled && styles.slotFilled,
              isActive && styles.slotActive,
              isPast && !isFilled && styles.slotPast,
            ]}
            onPress={() => handleTap(step)}
            activeOpacity={isFilled ? 0.7 : 1}
            disabled={!isFilled}>
            {isFilled ? (
              <Image source={{uri: photo!.uri}} style={styles.thumb} />
            ) : (
              <Text style={[styles.slotLabel, isActive && styles.slotLabelActive]}>
                {SLOT_LABELS[i]}
              </Text>
            )}
            {isFilled && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkBadgeText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const THUMB_SIZE = 64;

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  slot: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.success,
    borderWidth: 2,
  },
  slotActive: {
    borderColor: Colors.accent,
    borderWidth: 2.5,
    borderStyle: 'solid',
  },
  slotPast: {
    borderColor: Colors.error,
    borderStyle: 'solid',
  },
  slotLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  slotLabelActive: {
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    fontSize: 11,
    color: Colors.surface,
    fontFamily: 'Inter-SemiBold',
  },
});