import {useState, useEffect, useCallback, useRef} from 'react';
import {NativeModules, DeviceEventEmitter, AppState} from 'react-native';

const {PedalModule} = NativeModules;

const INACTIVITY_TIMEOUT_MS = 60000;
const BACKGROUND_POLL_INTERVAL_MS = 15000;

export function usePedalStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(0);

  const checkStatus = useCallback(async () => {
    try {
      if (PedalModule?.isPedalConnected) {
        const connected = await PedalModule.isPedalConnected();
        if (connected) {
          lastActivityRef.current = Date.now();
          setIsConnected(true);
        } else {
          const isRecent = Date.now() - lastActivityRef.current < INACTIVITY_TIMEOUT_MS;
          if (!isRecent) {
            setIsConnected(false);
          }
        }
      }
    } catch {
      const isRecent = Date.now() - lastActivityRef.current < INACTIVITY_TIMEOUT_MS;
      if (!isRecent) {
        setIsConnected(false);
      }
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const statusSub = DeviceEventEmitter.addListener(
      'onPedalStatusChange',
      (payload?: {connected?: boolean}) => {
        if (payload && typeof payload.connected === 'boolean') {
          if (payload.connected) {
            lastActivityRef.current = Date.now();
            setIsConnected(true);
          } else {
            const isRecent = Date.now() - lastActivityRef.current < INACTIVITY_TIMEOUT_MS;
            if (!isRecent) {
              setIsConnected(false);
            }
          }
        }
      },
    );

    const keySub = DeviceEventEmitter.addListener(
      'onHardwareKeyPress',
      () => {
        lastActivityRef.current = Date.now();
        setIsConnected(true);
      },
    );

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkStatus();
      }
    });

    const interval = setInterval(() => {
      const isRecent = Date.now() - lastActivityRef.current < INACTIVITY_TIMEOUT_MS;
      if (!isRecent) {
        checkStatus();
      }
    }, BACKGROUND_POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      statusSub.remove();
      keySub.remove();
      appStateSub.remove();
    };
  }, [checkStatus]);

  return {isConnected, checkStatus};
}
