// src/providers/AppProvider.tsx
import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { HomeStackParamList, MainTabParamList } from '@/types/navigation'
import { RideInterface } from '@/interfaces/IRide'
import { DriverInterface } from '@/interfaces/IDriver'
import { WalletInterface } from '@/interfaces/IWallet'
import { VehicleInterface } from '@/interfaces/IVehicle'
import { useAuthStore } from '@/storage/store/useAuthStore'
import ROUTES from '@/constants/routes'
import { useAlert } from '@/context/AlertContext'

// Custom Hooks
import { useDriverState } from '@/hooks/useDriverState'
import { useRidesState } from '@/hooks/useRidesState'
import { useWalletState } from '@/hooks/useWalletState'
import { useVehicleState } from '@/hooks/useVehicleState'

interface AppContextReturn {
  // Estado
  currentDriverData: DriverInterface | null
  rides: RideInterface[] | undefined
  ridesCount: number
  wallet: WalletInterface | null
  vehicle: VehicleInterface | null

  // Ações
  handleIsOnline: () => Promise<void>
  handleToggleInvisible: () => Promise<void>
  handleToDocuments: () => void
  handleToWallet: () => void
  handleDetailsRide: (ride: RideInterface) => void
  handleNotifications: () => void
  handleGoBack: () => void

  // Navegação
  navigationHomeStack: NativeStackNavigationProp<HomeStackParamList>
  navigationMainStack: NativeStackNavigationProp<MainTabParamList>
}

const AppContext = createContext<AppContextReturn | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Navegação
  const navigationHomeStack =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const navigationMainStack =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>()

  // Store
  const { driver, setCurrentMissionId } = useAuthStore()
  const { showAlert } = useAlert()

  // Estados via Custom Hooks
  const { currentDriverData, toggleOnline, toggleInvisible, updateVehicle } =
    useDriverState()
  const { rides, ridesCount, fetchRideById } = useRidesState()
  const { wallet } = useWalletState()
  const { vehicle } = useVehicleState({
    onVehicleChange: updateVehicle
  })

  // === Ações de Navegação ===
  const handleToDocuments = useCallback((): void => {
    navigationMainStack.navigate(ROUTES.MainTab.PROFILE, {
      screen: ROUTES.ProfileStack.PROFILE,
      params: {
        screen: ROUTES.ProfileStack.DOCUMENTS,
        params: { tempOpen: true }
      }
    })
    navigationMainStack.navigate(ROUTES.MainTab.PROFILE, {
      screen: ROUTES.ProfileStack.DOCUMENTS,
      fromProfile: true
    })
  }, [navigationMainStack])

  const handleToWallet = useCallback((): void => {
    navigationMainStack.navigate(ROUTES.MainTab.PROFILE, {
      screen: ROUTES.ProfileStack.WALLET,
      fromProfile: true
    })
  }, [navigationMainStack])

  const handleDetailsRide = useCallback(
    async (ride: RideInterface): Promise<void> => {
      if (!ride.id) {
        console.error('❌ ID da corrida não encontrado')
        return
      }
      if (!ride.pickup || !ride.dropoff) {
        showAlert({
          title: 'Erro na localização',
          message: 'A corrida selecionada não possui localização.',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
        return
      }

      // Buscar corrida e verificar status
      const rideById = await fetchRideById(ride.id)

      if (!rideById) {
        showAlert({
          title: 'Erro ao buscar corrida',
          message: 'A corrida selecionada foi excluida ou não existe.',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
        return
      }

      if (rideById.status !== 'idle') {
        if (rideById.driver?.id !== driver?.id) {
          showAlert({
            title: 'Corrida indisponível',
            message: 'A corrida selecionada já não está disponível.',
            type: 'warning',
            buttons: [{ text: 'OK' }]
          })
          setCurrentMissionId(null)
          return
        }
      }

      // Navegar para tela de detalhes
      navigationHomeStack.navigate(ROUTES.Rides.SUMMARY, {
        id: ride.id,
        location: {
          pickup: ride.pickup,
          dropoff: ride.dropoff
        },
        receiver: {
          name: ride.details?.receiver.name ?? '',
          phone: ride.details?.receiver.phone ?? ''
        },
        article: {
          type: ride.details?.item.type ?? '',
          description: ride.details?.item.description ?? ''
        }
      })
    },
    [
      navigationHomeStack,
      fetchRideById,
      driver?.id,
      setCurrentMissionId,
      showAlert
    ]
  )

  const handleNotifications = useCallback((): void => {
    navigationHomeStack.navigate(ROUTES.HomeStack.NOTIFICATIONS)
  }, [navigationHomeStack])

  const handleGoBack = useCallback((): void => {
    navigationMainStack.goBack()
  }, [navigationMainStack])

  const value: AppContextReturn = {
    // Estado
    currentDriverData,
    rides,
    ridesCount,
    wallet,
    vehicle,

    // Ações
    handleIsOnline: toggleOnline,
    handleToggleInvisible: toggleInvisible,
    handleToDocuments,
    handleToWallet,
    handleDetailsRide,
    handleNotifications,
    handleGoBack,

    // Navegação
    navigationHomeStack,
    navigationMainStack
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppProvider = (): AppContextReturn => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppProvider deve ser usado dentro de um AppProvider')
  }
  return context
}
