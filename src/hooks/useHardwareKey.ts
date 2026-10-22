import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

export type HardwareKey = 'volumeUp' | 'volumeDown';

const DEBOUNCE_MS = 600;

export function useHardwareKey(
  onPress: () => void,
  enabled = true,
  key: HardwareKey = 'volumeUp',
) {
  const callbackRef = useRef(onPress);
  callbackRef.current = onPress;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const lastPressTimeRef = useRef<number>(0);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onHardwareKeyPress',
      (payload?: {key?: HardwareKey}) => {
        const now = Date.now();
        if (
          enabledRef.current &&
          payload?.key === key &&
          now - lastPressTimeRef.current > DEBOUNCE_MS
        ) {
          lastPressTimeRef.current = now;
          callbackRef.current();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [key]);
}
