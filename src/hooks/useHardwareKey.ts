import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

export type HardwareKey = 'volumeUp' | 'volumeDown';

export function useHardwareKey(onPress: () => void, enabled = true, key: HardwareKey = 'volumeUp') {
  const callbackRef = useRef(onPress);
  callbackRef.current = onPress;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onHardwareKeyPress',
      (payload?: {key?: HardwareKey}) => {
        if (enabledRef.current && payload?.key === key) {
          callbackRef.current();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [key]);
}
