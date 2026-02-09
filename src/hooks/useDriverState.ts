// src/hooks/useDriverState.ts
import { useState, useEffect, useCallback } from 'react'
import { DriverInterface } from '@/interfaces/IDriver'
import { useDriversViewModel } from '@/viewModels/DriverViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useLocation } from './useLocation'
import { useAlert } from '@/context/AlertContext'

interface DriverStateReturn {
  currentDriverData: DriverInterface | null
  toggleOnline: () => Promise<void>
  toggleInvisible: () => Promise<void>
  updateVehicle: (vehicle: any) => Promise<void>
}

export const useDriverState = (): DriverStateReturn => {
  const { driver } = useAuthStore()
  const { listenDriverRealtime, updateDriver } = useDriversViewModel()
  const { requestCurrentLocation } = useLocation()
  const { showAlert } = useAlert()

  const [currentDriverData, setCurrentDriverData] =
    useState<DriverInterface | null>(driver)

  // Listener em tempo real para o motorista
  useEffect(() => {
    if (!driver?.id) return

    console.log('🔹 [useDriverState] Iniciando listener de motorista')
    const unsubscribeDriver = listenDriverRealtime(
      driver.id,
      setCurrentDriverData
    )

    return unsubscribeDriver
  }, [driver?.id])

  // Ação: Toggle online/offline
  const toggleOnline = useCallback(async (): Promise<void> => {
    if (!currentDriverData?.id) {
      console.error('❌ Driver ID não encontrado')
      return
    }

    const newValue = !currentDriverData.is_online

    try {
      console.log(`🔄 Alterando status online para: ${newValue}`)

      if (newValue) {
        // Going ONLINE - capture initial location
        console.log('📍 Capturando localização inicial...')
        const location = await requestCurrentLocation()

        if (!location) {
          showAlert({
            title: 'Erro',
            message:
              'Não foi possível obter sua localização. Verifique as permissões.',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
          return
        }

        // Optimistic update
        setCurrentDriverData(prev =>
          prev
            ? {
                ...prev,
                is_online: true,
                current_location: {
                  ...location,
                  updated_at: new Date()
                }
              }
            : prev
        )

        await updateDriver.mutateAsync({
          id: currentDriverData.id,
          driver: {
            is_online: true,
            is_invisible: false, // Initialize if doesn't exist
            current_location: {
              ...location,
              updated_at: new Date()
            }
          }
        })

        console.log('✅ Status online atualizado com localização inicial')
      } else {
        // Going OFFLINE
        setCurrentDriverData(prev =>
          prev ? { ...prev, is_online: false } : prev
        )

        await updateDriver.mutateAsync({
          id: currentDriverData.id,
          driver: { is_online: false }
        })

        console.log('✅ Status offline atualizado')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status online:', error)

      // Revert optimistic update
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_online: !newValue } : prev
      )
    }
  }, [currentDriverData, updateDriver, requestCurrentLocation, showAlert])

  // Ação: Toggle invisible mode
  const toggleInvisible = useCallback(async (): Promise<void> => {
    if (!currentDriverData?.id) {
      console.error('❌ Driver ID não encontrado')
      return
    }

    if (!currentDriverData.is_online) {
      showAlert({
        title: 'Aviso',
        message: 'Você precisa estar online para ativar o modo invisível.',
        type: 'warning',
        buttons: [{ text: 'OK' }]
      })
      return
    }

    const newValue = !currentDriverData.is_invisible

    try {
      console.log(`🕶️ Alterando modo invisível para: ${newValue}`)

      // Optimistic update
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_invisible: newValue } : prev
      )

      await updateDriver.mutateAsync({
        id: currentDriverData.id,
        driver: { is_invisible: newValue }
      })

      console.log('✅ Modo invisível atualizado')

      // Show feedback to user
      if (newValue) {
        showAlert({
          title: 'Modo Invisível Ativado',
          message:
            'Você está online mas não aparecerá no mapa para passageiros. Sua localização não será rastreada.',
          type: 'info',
          buttons: [{ text: 'OK' }]
        })
      }
    } catch (error) {
      console.error('❌ Erro ao alternar modo invisível:', error)

      // Revert optimistic update
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_invisible: !newValue } : prev
      )
    }
  }, [currentDriverData, updateDriver])

  // Ação: Atualizar veículo do motorista
  const updateVehicle = useCallback(
    async (vehicleUpdated: any | null): Promise<void> => {
      if (!currentDriverData?.id) {
        console.error('❌ Driver ID não encontrado')
        return
      }

      try {
        if (!vehicleUpdated) {
          await updateDriver.mutateAsync({
            id: currentDriverData.id,
            driver: { vehicle: null as any }
          })
          return
        }

        console.log(
          `🔄 Atualizando veiculo: ${vehicleUpdated.brand} - ${vehicleUpdated.model}`
        )
        await updateDriver.mutateAsync({
          id: currentDriverData.id,
          driver: { vehicle: vehicleUpdated }
        })

        console.log('✅ Veiculo atualizado com sucesso')
      } catch (error) {
        console.error('❌ Erro ao atualizar veiculo:', error)
      }
    },
    [currentDriverData, updateDriver]
  )

  return {
    currentDriverData,
    toggleOnline,
    toggleInvisible,
    updateVehicle
  }
}
