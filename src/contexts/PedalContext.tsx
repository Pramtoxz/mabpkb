import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {DeviceEventEmitter} from 'react-native';

type PedalCallback = () => void;

interface PedalContextType {
  register: (cb: PedalCallback) => void;
  unregister: () => void;
}

const PedalContext = createContext<PedalContextType | undefined>(undefined);

export function PedalProvider({children}: {children: React.ReactNode}) {
  const callbackRef = useRef<PedalCallback | null>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onHardwareKeyPress',
      (payload?: {key?: string}) => {
        if (payload?.key === 'volumeDown') {
          callbackRef.current?.();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const register = useCallback((cb: PedalCallback) => {
    callbackRef.current = cb;
  }, []);

  const unregister = useCallback(() => {
    callbackRef.current = null;
  }, []);

  const value = useMemo(
    () => ({register, unregister}),
    [register, unregister],
  );

  return (
    <PedalContext.Provider value={value}>{children}</PedalContext.Provider>
  );
}

export function usePedal() {
  const ctx = useContext(PedalContext);
  if (!ctx) {
    throw new Error('usePedal must be used within PedalProvider');
  }
  return ctx;
}
