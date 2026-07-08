import React, {createContext, useContext} from 'react';

interface TabNavContextValue {
  setActiveTab: (index: number) => void;
  activeTab: number;
}

const TabNavContext = createContext<TabNavContextValue | null>(null);

export function TabNavProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TabNavContextValue;
}) {
  return <TabNavContext.Provider value={value}>{children}</TabNavContext.Provider>;
}

export function useTabNav() {
  const ctx = useContext(TabNavContext);
  if (!ctx) {
    throw new Error('useTabNav must be used within TabNavProvider');
  }
  return ctx;
}
