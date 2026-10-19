import React, {useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircle2, XCircle, AlertCircle, X} from 'lucide-react-native';
import {Colors} from '../constants/colors';

export interface FloatingToastProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  actionText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export const FloatingToast: React.FC<FloatingToastProps> = ({
  visible,
  message,
  subMessage,
  actionText,
  type = 'success',
  onAction,
  onClose,
  duration = 2500,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose, opacity, translateY]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, handleDismiss, opacity, translateY]);

  if (!visible) {
    return null;
  }

  const isError = type === 'error';
  const isWarning = type === 'warning';
  const iconColor = isError ? Colors.error : isWarning ? Colors.warning : Colors.emeraldMint;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 16) + (Platform.OS === 'android' ? 8 : 4),
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <TouchableOpacity
        style={styles.innerContent}
        activeOpacity={0.9}
        onPress={handleDismiss}>
        <View style={styles.iconCircle}>
          {isError ? (
            <XCircle size={18} color={iconColor} strokeWidth={2.2} />
          ) : isWarning ? (
            <AlertCircle size={18} color={iconColor} strokeWidth={2.2} />
          ) : (
            <CheckCircle2 size={18} color={iconColor} strokeWidth={2.2} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.messageText} numberOfLines={1}>
            {message}
          </Text>
          {Boolean(subMessage) && (
            <Text style={styles.subMessageText} numberOfLines={1}>
              {subMessage}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {Boolean(actionText) && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => {
                handleDismiss();
                if (onAction) {
                  onAction();
                }
              }}>
              <Text style={styles.actionButtonText}>{actionText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={handleDismiss}>
            <X size={14} color={Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  innerContent: {
    backgroundColor: Colors.neutral,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.darkNavBarBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.darkCardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  messageText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  subMessageText: {
    color: Colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingToast;
