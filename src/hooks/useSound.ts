import {useRef, useEffect, useCallback} from 'react';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

type SoundPattern = 'success' | 'error' | 'submit' | 'tick' | 'beep' | 'complete';

const SOUND_MAP: Record<SoundPattern, string> = {
  success: 'sound.mp3',
  error: 'sound.mp3',
  submit: 'sound.mp3',
  tick: 'tick.mp3',
  beep: 'beep.mp3',
  complete: 'complete.mp3',
};

export function useSound() {
  const cache = useRef<Map<string, Sound>>(new Map());

  useEffect(() => {
    const patterns: SoundPattern[] = ['success', 'tick', 'beep', 'complete'];
    const loaded = new Map<string, Sound>();

    patterns.forEach(pattern => {
      const fileName = SOUND_MAP[pattern];
      if (loaded.has(fileName)) {return;}
      const s = new Sound(fileName, Sound.MAIN_BUNDLE, err => {
        if (!err) {
          loaded.set(fileName, s);
        }
      });
    });

    setTimeout(() => {
      cache.current = loaded;
    }, 500);

    return () => {
      loaded.forEach(s => s.release());
    };
  }, []);

  const play = useCallback((pattern: SoundPattern = 'success') => {
    const s = cache.current.get(SOUND_MAP[pattern]);
    if (!s) {return;}

    const playOnce = (delay: number) =>
      new Promise<void>(resolve => {
        setTimeout(() => {
          s.stop(() => {
            s.play(() => resolve());
          });
        }, delay);
      });

    if (pattern === 'tick' || pattern === 'beep') {
      playOnce(0);
    } else if (pattern === 'success') {
      playOnce(0);
    } else if (pattern === 'error') {
      playOnce(0).then(() => playOnce(150));
    } else if (pattern === 'submit') {
      playOnce(0).then(() => playOnce(200)).then(() => playOnce(200));
    } else if (pattern === 'complete') {
      playOnce(0);
    }
  }, []);

  return {play};
}