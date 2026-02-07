// src/hooks/useDriverState.ts
import { useState, useEffect, useCallback } from 'react'
import { DriverInterface } from '@/interfaces/IDriver'
import { useDriversViewModel } from '@/viewModels/DriverViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'

interface DriverStateReturn {
  currentDriverData: DriverInterface | null
  toggleOnline: () => Promise<void>
  updateVehicle: (vehicle: any) => Promise<void>
}

export const useDriverState = (): DriverStateReturn => {
  const { driver } = useAuthStore()
  const { listenDriverRealtime, updateDriver } = useDriversViewModel()

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

      // Otimista update
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_online: newValue } : prev
      )

      await updateDriver.mutateAsync({
        id: currentDriverData.id,
        driver: { is_online: newValue }
      })

      console.log('✅ Status online atualizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao atualizar status online:', error)

      // Revert otimista update em caso de erro
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_online: !newValue } : prev
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
    updateVehicle
  }
}
