// src/hooks/useVehicleState.ts
import { useState, useEffect } from 'react'
import { VehicleInterface } from '@/interfaces/IVehicle'
import { useVehiclesViewModel } from '@/viewModels/VehicleViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'

interface VehicleStateReturn {
  vehicle: VehicleInterface | null
  onVehicleChange?: (vehicle: VehicleInterface | null) => void
}

interface UseVehicleStateProps {
  onVehicleChange?: (vehicle: VehicleInterface | null) => void
}

export const useVehicleState = (
  props?: UseVehicleStateProps
): VehicleStateReturn => {
  const { driver } = useAuthStore()
  const { listenAllByField: listenAllVehicleByField } = useVehiclesViewModel()

  const [vehicle, setVehicle] = useState<VehicleInterface | null>(
    driver?.vehicle || null
  )

  // Listener para veículos do motorista
  useEffect(() => {
    if (!driver?.id) return

    console.log('🔹 [useVehicleState] Iniciando listener de veiculo')
    const unsubscribeVehicle = listenAllVehicleByField(
      'user_id' as any,
      driver.id,
      (response: VehicleInterface[]) => {
        // Filtrar veículo padrão
        const filteredVehicles = response.filter(
          (v: VehicleInterface) => v.isDefault
        )

        const defaultVehicle =
          filteredVehicles.length > 0
            ? filteredVehicles[0]
            : driver.vehicle
              ? driver.vehicle
              : null

        setVehicle(defaultVehicle)

        // Callback opcional para atualizar motorista
        if (props?.onVehicleChange) {
          props.onVehicleChange(defaultVehicle)
        }
      }
    )

    return unsubscribeVehicle
  }, [driver?.id])

  return {
    vehicle
  }
}
