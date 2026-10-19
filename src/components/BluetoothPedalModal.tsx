import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {Colors, Spacing, Radius} from '../constants';
import {useSound} from '../hooks/useSound';
import {useHaptic} from '../hooks/useHaptic';
export interface BluetoothPedalModalProps {
  visible: boolean;
  type: 'connected' | 'pedal_pressed';
  onClose: () => void;
}

export default function BluetoothPedalModal({
  visible,
  type,
  onClose,
}: BluetoothPedalModalProps) {
  const {play: playSound} = useSound();
  const {trigger: haptic} = useHaptic();

  useEffect(() => {
    if (visible) {
      playSound('beep');
      haptic('success');
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, playSound, haptic]);

  if (!visible) {
    return null;
  }

  const isConnectedType = type === 'connected';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.cardContainer}>
            <View style={styles.badgePill}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>
                {isConnectedType ? 'Hardware Tersambung' : 'Pedal Kaki Terdeteksi'}
              </Text>
            </View>
                <View style={styles.lottieBox}>
              <LottieView
                source={require('../assets/lottie/bluetooth.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  lottie: {
    width: 260,
    height: 260,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 214, 173, 0.15)',
    borderWidth: 1,
    borderColor: Colors.emeraldMint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldMint,
  },
  badgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: Colors.emeraldMint,
    letterSpacing: 0.4,
  },
});
