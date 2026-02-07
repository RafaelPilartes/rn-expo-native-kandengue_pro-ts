// src/hooks/useRidesState.ts
import { useState, useEffect } from 'react'
import { RideInterface } from '@/interfaces/IRide'
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'

interface RidesStateReturn {
  rides: RideInterface[] | undefined
  ridesCount: number
  fetchRideById: (id: string) => Promise<RideInterface | null>
}

export const useRidesState = (): RidesStateReturn => {
  const { driver } = useAuthStore()
  const {
    listenAllByField: listenAllRidesByField,
    fetchRideById,
    fetchAllRidesByField
  } = useRidesViewModel()

  const [rides, setRides] = useState<RideInterface[]>()
  const [ridesCount, setRidesCount] = useState<number>(0)

  // Listener para corridas com status 'idle'
  useEffect(() => {
    if (!driver?.id) return

    console.log('🔹 [useRidesState] Iniciando listener de corridas idle')
    const unsubscribeRides = listenAllRidesByField('status', 'idle', setRides)

    return unsubscribeRides
  }, [driver?.id])

  // Buscar contagem total de corridas do motorista
  useEffect(() => {
    async function fetchDriverRides() {
      if (!driver?.id) return

      const rides = await fetchAllRidesByField('driver.id' as any, driver.id)

      if (rides) {
        setRidesCount(rides.data.length)
      }
    }

    fetchDriverRides()
  }, [driver?.id])

  return {
    rides,
    ridesCount,
    fetchRideById
  }
}
