// src/providers/NetworkProvider.tsx
import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

const NetworkContext = React.createContext<NetworkState>({
  isConnected: true,
  isInternetReachable: true,
});

export const useNetwork = () => React.useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [networkState, setNetworkState] = React.useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
}
