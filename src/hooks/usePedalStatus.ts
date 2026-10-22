import {useState, useEffect, useCallback} from 'react';
import {NativeModules, DeviceEventEmitter, AppState} from 'react-native';

const {PedalModule} = NativeModules;

const POLL_INTERVAL_MS = 2500;

export function usePedalStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    try {
      if (PedalModule?.isPedalConnected) {
        const connected = await PedalModule.isPedalConnected();
        setIsConnected(Boolean(connected));
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const statusSub = DeviceEventEmitter.addListener(
      'onPedalStatusChange',
      (payload?: {connected?: boolean}) => {
        if (payload && typeof payload.connected === 'boolean') {
          setIsConnected(payload.connected);
        }
      },
    );

    const keySub = DeviceEventEmitter.addListener(
      'onHardwareKeyPress',
      () => {
        setIsConnected(true);
      },
    );

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkStatus();
      }
    });

    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      statusSub.remove();
      keySub.remove();
      appStateSub.remove();
    };
  }, [checkStatus]);

  return {isConnected, checkStatus};
}
