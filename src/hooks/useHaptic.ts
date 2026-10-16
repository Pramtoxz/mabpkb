import {useCallback} from 'react';
import {Vibration, Platform} from 'react-native';

type HapticPattern = 'capture' | 'success' | 'error' | 'detect' | 'submit';

const PATTERNS: Record<HapticPattern, number[]> = {
  capture: [50],
  success: [100],
  error: [50, 100, 50],
  detect: [50],
  submit: [50, 100, 50, 100, 50],
};

export function useHaptic() {
  const trigger = useCallback((pattern: HapticPattern = 'capture') => {
    if (Platform.OS !== 'android') {return;}
    Vibration.vibrate(PATTERNS[pattern]);
  }, []);

  return {trigger};
}