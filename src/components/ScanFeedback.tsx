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
import {Colors, Fonts} from '../constants';

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

  const bgColor = type === 'success' ? '#dcfce7' : type === 'error' ? '#fef2f2' : '#eff6ff';
  const borderColor = type === 'success' ? '#16a34a' : type === 'error' ? Colors.destructive : Colors.primary;
  const textColor = type === 'success' ? '#16a34a' : type === 'error' ? Colors.destructive : Colors.primary;

  return (
    <Animated.View style={[styles.container, {backgroundColor: bgColor, borderColor}, animStyle]}>
      {type === 'success' && <CheckIcon size={48} color="#16a34a" />}
      {type === 'error' && <XIcon size={48} color={Colors.destructive} />}
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
    fontFamily: Fonts.heading.bold,
    fontSize: 22,
    textAlign: 'center',
  },
});
