import React, {createContext, useContext, useEffect, useRef} from 'react';
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

  const register = (cb: PedalCallback) => {
    callbackRef.current = cb;
  };

  const unregister = () => {
    callbackRef.current = null;
  };

  return (
    <PedalContext.Provider value={{register, unregister}}>
      {children}
    </PedalContext.Provider>
  );
}

export function usePedal() {
  const ctx = useContext(PedalContext);
  if (!ctx) {
    throw new Error('usePedal must be used within PedalProvider');
  }
  return ctx;
}
