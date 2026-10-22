import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {Colors, Spacing, Radius, Animations} from '../constants';

export interface SubmitBpkbModalProps {
  visible: boolean;
  status: 'submitting' | 'success';
  onFinish?: () => void;
}

export default function SubmitBpkbModal({
  visible,
  status,
  onFinish,
}: SubmitBpkbModalProps) {
  useEffect(() => {
    if (visible && status === 'success') {
      const timer = setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [visible, status, onFinish]);

  if (!visible) {
    return null;
  }

  const isSuccess = status === 'success';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          <View style={styles.lottieBox}>
            {isSuccess ? (
              <LottieView
                source={Animations.success}
                autoPlay
                loop={false}
                style={styles.lottie}
              />
            ) : (
              <LottieView
                source={Animations.business}
                autoPlay
                loop
                style={styles.lottie}
              />
            )}
          </View>

          <Text
            style={[
              styles.statusTitle,
              isSuccess ? styles.statusTitleSuccess : styles.statusTitleSubmitting,
            ]}>
            {isSuccess ? 'Berkas Berhasil Terkirim' : 'Mengirim Berkas BPKB...'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isSuccess
              ? 'Data dan dokumen telah tersimpan di server'
              : 'Mohon tunggu sebentar, data sedang diproses'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  lottieBox: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  lottie: {
    width: 240,
    height: 240,
  },
  statusTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusTitleSubmitting: {
    color: Colors.textPrimary,
  },
  statusTitleSuccess: {
    color: Colors.aciaxSuccessGreen,
  },
  statusSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
