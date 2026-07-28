import {useEffect, useRef} from 'react';
import {VolumeManager} from 'react-native-volume-manager';

export function useVolumeKey(onPress: () => void, enabled = true) {
  const callbackRef = useRef(onPress);
  callbackRef.current = onPress;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const listener = VolumeManager.addVolumeListener(() => {
      if (enabledRef.current) {
        callbackRef.current();
      }
    });

    return () => {
      listener.remove();
    };
  }, []);
}
