import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import {Path, Svg} from 'react-native-svg';
import {Colors, Typography} from '../constants';

export type AlertType = 'alert' | 'confirm' | 'success' | 'error';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

function AlertIcon({type}: {type: AlertType}) {
  if (type === 'success') {
    return (
      <View style={[styles.iconWrap, styles.iconWrapSuccess]}>
        <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke={Colors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }

  if (type === 'error') {
    return (
      <View style={[styles.iconWrap, styles.iconWrapError]}>
        <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
          <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.error} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.iconWrap, styles.iconWrapAlert]}>
      <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
        <Path d="M12 9v4M12 17h.01" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'alert',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Batal',
}: CustomAlertProps) {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isConfirm = type === 'confirm';

  const gradientColors: [string, string] = isSuccess
    ? [Colors.success, '#2D6B52']
    : isError
      ? [Colors.error, '#9E3A3A']
      : [Colors.accent, '#B8903A'];

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating
      onBackdropPress={isConfirm ? onCancel : onConfirm}>
      <View style={styles.container}>
        <AlertIcon type={type} />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonRow}>
          {isConfirm && onCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.confirmBtnWrap, !isConfirm && styles.confirmBtnFull]} onPress={onConfirm} activeOpacity={0.8}>
            <LinearGradient
              colors={gradientColors}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.confirmBtn}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconWrapSuccess: {
    backgroundColor: Colors.successLight,
  },
  iconWrapError: {
    backgroundColor: Colors.errorLight,
  },
  iconWrapAlert: {
    backgroundColor: Colors.accentLight,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  cancelText: {
    ...Typography.label,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  confirmBtnWrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmBtnFull: {
    flex: 1,
  },
  confirmBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    ...Typography.label,
    fontSize: 15,
    color: Colors.textOnAccent,
    fontFamily: 'Inter-SemiBold',
  },
});