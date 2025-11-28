// src/providers/AppContext.tsx
import { WalletInterface } from '@/interfaces/IWallet';
import { useAppProvider } from '@/providers/AppProvider';
import React, { createContext, useContext, ReactNode } from 'react';

interface AppContextType {
  currentDriverData: any; // Ajuste o tipo conforme sua interface
  rides: any;
  wallet: WalletInterface | null;
  handleIsOnline: () => Promise<void>;
  handleToDocuments: () => void;
  handleToWallet: () => void;
  handleDetailsRide: (ride: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const appData = useAppProvider();

  return <AppContext.Provider value={appData}>{children}</AppContext.Provider>;
};

export const useHome = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};
