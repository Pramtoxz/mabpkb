import React, {createContext, useContext, useState, useCallback} from 'react';

interface TabNavContextValue {
  setActiveTab: (index: number) => void;
  activeTab: number;
  pendingTrackId: string | null;
  setPendingTrackId: (id: string | null) => void;
  isTabBarHidden: boolean;
  setIsTabBarHidden: (hidden: boolean) => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
}

const TabNavContext = createContext<TabNavContextValue | null>(null);

export function TabNavProvider({children}: {children: React.ReactNode}) {
  const [activeTab, setActiveTabState] = useState(0);
  const [pendingTrackId, setPendingTrackId] = useState<string | null>(null);
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const setActiveTab = useCallback((index: number) => {
    setActiveTabState(index);
  }, []);

  return (
    <TabNavContext.Provider
      value={{
        activeTab,
        setActiveTab,
        pendingTrackId,
        setPendingTrackId,
        isTabBarHidden,
        setIsTabBarHidden,
        showWelcome,
        setShowWelcome,
      }}>
      {children}
    </TabNavContext.Provider>
  );
}

export function useTabNav() {
  const ctx = useContext(TabNavContext);
  if (!ctx) {
    throw new Error('useTabNav must be used within TabNavProvider');
  }
  return ctx;
}
