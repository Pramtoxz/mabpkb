import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ResumableZoom} from 'react-native-zoom-toolkit';
import Svg, {Path} from 'react-native-svg';
import {Colors, Radius, Spacing} from '../constants';
import {useScan} from '../contexts/ScanContext';

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

const SLOT_LABELS = ['HAL 1', 'HAL 2', 'HAL 3', 'HAL 4'];

export default function ThumbnailStrip({
  currentStep,
  onRetake,
}: ThumbnailStripProps) {
  const navigation = useNavigation<any>();
  const {state, retakeFromStep} = useScan();
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
                <Image source={{uri: photo!.uri}} style={styles.thumb} />
              ) : (
                <Text
                  style={[
                    styles.slotLabel,
                    isActive && styles.slotLabelActive,
                  ]}>
                  {SLOT_LABELS[i]}
                </Text>
              )}
              {isFilled && (
                <View style={styles.checkBadge}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke={Colors.white}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
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
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>Halaman {previewStep}</Text>
                  <View style={styles.zoomHintPill}>
                    <Text style={styles.zoomHintText}>Pinch / Zoom 120 FPS</Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle}>
                  {previewStep != null ? STEP_TITLES[previewStep - 1] : ''}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setPreviewStep(null)}
                style={styles.closeBtn}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    stroke={Colors.textSecondary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {previewPhoto?.uri ? (
              <View style={styles.previewImageContainer}>
                <ResumableZoom maxScale={5} style={styles.zoomContainer}>
                  <Image
                    source={{uri: previewPhoto.uri}}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </ResumableZoom>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPreviewStep(null)}
                activeOpacity={0.75}>
                <Text style={styles.cancelBtnText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => previewStep && handleRetakeConfirm(previewStep)}
                activeOpacity={0.85}>
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
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.emeraldMint,
    borderWidth: 2,
  },
  slotActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    borderStyle: 'solid',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  slotPast: {
    borderColor: Colors.borderLight,
    borderStyle: 'solid',
  },
  slotLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  slotLabelActive: {
    color: Colors.primary,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.dimDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    color: Colors.textHeadline,
  },
  zoomHintPill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  zoomHintText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9.5,
    color: Colors.primary,
  },
  modalSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewImageContainer: {
    width: '100%',
    height: 380,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.darkCardBg,
    marginBottom: Spacing.md,
  },
  zoomContainer: {
    width: '100%',
    height: '100%',
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
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  cancelBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  retakeBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  retakeBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});