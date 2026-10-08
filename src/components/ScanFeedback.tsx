import React, {useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {CheckIcon, XIcon} from './TabIcons';
import {Colors, Typography} from '../constants';

type FeedbackType = 'success' | 'error' | 'result';

interface ScanFeedbackProps {
  type: FeedbackType;
  message: string;
  visible: boolean;
}

export default function ScanFeedback({type, message, visible}: ScanFeedbackProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.1, {duration: 200, easing: Easing.out(Easing.cubic)}),
        withTiming(1, {duration: 150, easing: Easing.inOut(Easing.ease)}),
      );
      opacity.value = withTiming(1, {duration: 200});
    } else {
      scale.value = withTiming(0.5, {duration: 150});
      opacity.value = withTiming(0, {duration: 150});
    }
  }, [visible, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  if (!visible) {return null;}

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const bgColor = isSuccess ? Colors.successLight : isError ? Colors.errorLight : Colors.accentLight;
  const borderColor = isSuccess ? Colors.success : isError ? Colors.error : Colors.accent;
  const textColor = isSuccess ? Colors.success : isError ? Colors.error : Colors.accent;
  const iconColor = isSuccess ? Colors.success : isError ? Colors.error : Colors.accent;

  return (
    <Animated.View style={[styles.container, {backgroundColor: bgColor, borderColor}, animStyle]}>
      {isSuccess && <CheckIcon size={48} color={iconColor} />}
      {isError && <XIcon size={48} color={iconColor} />}
      <Text style={[styles.message, {color: textColor}]} numberOfLines={3}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    borderRadius: 24,
    borderWidth: 2,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    gap: 12,
  },
  message: {
    ...Typography.h2,
    textAlign: 'center',
  },
});