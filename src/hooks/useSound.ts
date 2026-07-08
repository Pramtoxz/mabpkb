import {useRef, useEffect, useCallback} from 'react';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

type SoundPattern = 'success' | 'error' | 'submit';

export function useSound() {
  const soundRef = useRef<Sound | null>(null);

  useEffect(() => {
    const s = new Sound('sound.mp3', Sound.MAIN_BUNDLE, err => {
      if (err) {
        soundRef.current = null;
        return;
      }
      soundRef.current = s;
    });

    return () => {
      s.release();
    };
  }, []);

  const play = useCallback((pattern: SoundPattern = 'success') => {
    const s = soundRef.current;
    if (!s) {return;}

    const playOnce = (delay: number) =>
      new Promise<void>(resolve => {
        setTimeout(() => {
          s.stop(() => {
            s.play(() => resolve());
          });
        }, delay);
      });

    if (pattern === 'success') {
      playOnce(0);
    } else if (pattern === 'error') {
      playOnce(0).then(() => playOnce(150));
    } else if (pattern === 'submit') {
      playOnce(0).then(() => playOnce(200)).then(() => playOnce(200));
    }
  }, []);

  return {play};
}
