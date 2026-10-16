import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography } from '../constants';
import { useScan } from '../contexts/ScanContext';
import { useAlert } from '../contexts/AlertContext';

interface ThumbnailStripProps {
  currentStep: number;
  onRetake?: (step: number) => void;
}

const STEP_TITLES = [
  'Identitas Pemilik',
  'Identitas Kendaraan',
  'Identitas Kendaraan Lanjutan',
  'Dokumen Persyaratan',
];

const SLOT_LABELS = ['Hal 1', 'Hal 2', 'Hal 3', 'Hal 4'];

export default function ThumbnailStrip({ currentStep, onRetake }: ThumbnailStripProps) {
  const navigation = useNavigation<any>();
  const { state, retakeFromStep } = useScan();
  const [previewStep, setPreviewStep] = useState<number | null>(null);
  const photos = [state.photo1, state.photo2, state.photo3, state.photo4];

  const handleTap = (step: number) => {
    if (!photos[step - 1]) {
      return;
    }
    setPreviewStep(step);
  };

  const handleRetakeConfirm = (step: number) => {
    setPreviewStep(null);
    if (onRetake) {
      onRetake(step);
      return;
    }
    retakeFromStep(step);
    navigation.navigate(`ScanStep${step}`);
  };

  const previewPhoto = previewStep != null ? photos[previewStep - 1] : null;
  const isCropped = previewPhoto?.uri ? previewPhoto.uri.includes('_scan.jpg') : false;

  return (
    <>
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
                <Image source={{ uri: photo!.uri }} style={styles.thumb} />
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

      <Modal
        visible={previewStep !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewStep(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  Halaman {previewStep}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {previewStep != null ? STEP_TITLES[previewStep - 1] : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewStep(null)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            {previewPhoto?.uri ? (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{ uri: previewPhoto.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPreviewStep(null)}>
                <Text style={styles.cancelBtnText}>Tutup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => previewStep && handleRetakeConfirm(previewStep)}>
                <Text style={styles.retakeBtnText}>Foto Ulang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.dimDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusBadgeSuccess: {
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  statusBadgeWarning: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    fontSize: 12,
  },
  statusTextSuccess: {
    color: Colors.success,
    fontFamily: 'Inter-SemiBold',
  },
  statusTextWarning: {
    color: Colors.warning,
    fontFamily: 'Inter-SemiBold',
  },
  previewImageContainer: {
    width: '100%',
    height: 340,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.darkCardBg,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  cancelBtnText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  retakeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: {
    ...Typography.label,
    color: Colors.surface,
    fontFamily: 'Inter-SemiBold',
  },
});