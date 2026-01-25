import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from './zustandMMKVStorage'
import { AUTH_STORAGE_ID } from '../constants'
import { DriverInterface } from '@/interfaces/IDriver'
import { WalletInterface } from '@/interfaces/IWallet'

interface AuthState {
  driver: DriverInterface | null
  wallet: WalletInterface | null
  currentMissionId: string | null
  isFirstTime: boolean

  // Actions
  setDriver: (driver: DriverInterface | null) => void
  setWallet: (wallet: WalletInterface | null) => void
  setCurrentMissionId: (missionId: string | null) => void
  logout: () => void
  setFirstTime: (isFirstTime: boolean) => void
}

const INITIAL_STATE: Omit<
  AuthState,
  'setDriver' | 'setWallet' | 'setCurrentMissionId' | 'logout' | 'setFirstTime'
> = {
  driver: null,
  wallet: null,
  currentMissionId: null,
  isFirstTime: true
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      ...INITIAL_STATE,

      setDriver: driver => set({ driver }),

      setWallet: wallet => set({ wallet }),

      setCurrentMissionId: missionId => set({ currentMissionId: missionId }),

      logout: () => set({ driver: null, currentMissionId: null }),

      setFirstTime: isFirstTime => set({ isFirstTime })
    }),
    {
      name: AUTH_STORAGE_ID,
      storage: createJSONStorage(() => zustandMMKVStorage)
    }
  )
)

// 🔹 Helper — útil em hooks/viewmodels:
export const useIsAuthenticated = () => !!useAuthStore(s => s.driver)
