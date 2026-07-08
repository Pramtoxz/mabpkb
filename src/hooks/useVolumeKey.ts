import {useEffect, useRef, useCallback} from 'react';
import {VolumeManager} from 'react-native-volume-manager';

const VOLUME_STEP = 0.05;

export function useVolumeKey(onPress: () => void, enabled = true) {
  const lastVolume = useRef(0);
  const callbackRef = useRef(onPress);
  callbackRef.current = onPress;

  const restoreVolume = useCallback(async () => {
    try {
      const {volume} = await VolumeManager.getVolume();
      await VolumeManager.setVolume(Math.max(0, volume - VOLUME_STEP));
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) {return;}

    let isMounted = true;

    const setup = async () => {
      try {
        await VolumeManager.showNativeVolumeUI({enabled: false});
        const {volume} = await VolumeManager.getVolume();
        if (isMounted) {lastVolume.current = volume;}
      } catch {}

      const listener = VolumeManager.addVolumeListener(({volume}) => {
        if (volume > lastVolume.current) {
          callbackRef.current();
          restoreVolume();
        }
        lastVolume.current = volume;
      });

      return () => {
        listener.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    setup().then(fn => {
      if (isMounted && fn) {cleanup = fn;}
    });

    return () => {
      isMounted = false;
      cleanup?.();
      VolumeManager.showNativeVolumeUI({enabled: true}).catch(() => {});
    };
  }, [enabled, restoreVolume]);
}
