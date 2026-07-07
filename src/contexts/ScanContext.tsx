import React, {createContext, useContext, useState, useCallback} from 'react';

export interface ScanImage {
  uri: string;
  type: string;
  name: string;
}

export interface DealerData {
  fk_dealer: string;
  nm_dealer: string;
}

interface ScanState {
  photo1: ScanImage | null;
  photo2: ScanImage | null;
  photo3: ScanImage | null;
  photo4: ScanImage | null;
  nomesin: string;
  nobpkb: string;
  dealer: DealerData | null;
}

interface ScanContextType {
  state: ScanState;
  setPhoto1: (img: ScanImage) => void;
  setPhoto2: (img: ScanImage) => void;
  setPhoto3: (img: ScanImage) => void;
  setPhoto4: (img: ScanImage) => void;
  setNomesin: (val: string) => void;
  setNobpkb: (val: string) => void;
  setDealer: (val: DealerData) => void;
  resetScan: () => void;
}

const initialState: ScanState = {
  photo1: null,
  photo2: null,
  photo3: null,
  photo4: null,
  nomesin: '',
  nobpkb: '',
  dealer: null,
};

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<ScanState>(initialState);

  const setPhoto1 = useCallback((img: ScanImage) => setState(s => ({...s, photo1: img})), []);
  const setPhoto2 = useCallback((img: ScanImage) => setState(s => ({...s, photo2: img})), []);
  const setPhoto3 = useCallback((img: ScanImage) => setState(s => ({...s, photo3: img})), []);
  const setPhoto4 = useCallback((img: ScanImage) => setState(s => ({...s, photo4: img})), []);
  const setNomesin = useCallback((val: string) => setState(s => ({...s, nomesin: val})), []);
  const setNobpkb = useCallback((val: string) => setState(s => ({...s, nobpkb: val})), []);
  const setDealer = useCallback((val: DealerData) => setState(s => ({...s, dealer: val})), []);
  const resetScan = useCallback(() => setState(initialState), []);

  return (
    <ScanContext.Provider
      value={{state, setPhoto1, setPhoto2, setPhoto3, setPhoto4, setNomesin, setNobpkb, setDealer, resetScan}}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within ScanProvider');
  }
  return context;
}
