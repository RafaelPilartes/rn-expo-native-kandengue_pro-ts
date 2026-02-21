// src/contexts/TrackingContext.tsx
import React, { createContext, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useLocation } from '@/hooks/useLocation'

import { LiveLocationType } from '@/types/ride'
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { RideInterface } from '@/interfaces/IRide'

interface TrackRideContextType {
  currentRide: RideInterface | null
  isLoading: boolean
  resolveCurrentRide: () => Promise<void>
}

export const TrackRideContext = createContext<TrackRideContextType>(
  {} as TrackRideContextType
)

export const TrackRideProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { driver, currentMissionId, setCurrentMissionId } = useAuthStore()
  const { startTracking, stopTracking, isTracking } = useLocation()

  const { fetchRideById, fetchAllRidesByField } = useRidesViewModel()

  const [currentRide, setCurrentRide] = useState<RideInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // const lastUpdateRef = useRef<number>(0) // throttle controller moved to background task

  const resolveCurrentRide = async () => {
    setIsLoading(true)

    if (currentMissionId) {
      const ride = await fetchRideById(currentMissionId)

      if (!ride) {
        setCurrentMissionId(null)
        setCurrentRide(null)
        stopTracking()
        setIsLoading(false)
        return
      }

      if (ride.driver?.id !== driver?.id) {
        setCurrentMissionId(null)
        setCurrentRide(null)
        stopTracking()
        setIsLoading(false)
        return
      }

      if (ride.status === 'completed' || ride.status === 'canceled') {
        setCurrentMissionId(null)
        setCurrentRide(null)
        stopTracking()
        setIsLoading(false)
        return
      }

      if (!isTracking) {
        startTracking('RIDE')
      }
      setCurrentRide(ride ?? null)
      setIsLoading(false)
      return
    }

    setCurrentRide(null)
    stopTracking()

    if (!driver?.id) {
      return
    }

    const rides = await fetchAllRidesByField('driver.id' as any, driver.id, 20)

    if (!rides) {
      return
    }

    // filter rides that are not idle, completed, canceled
    const pendingRide = rides.data?.find(
      r =>
        r.status !== 'completed' &&
        r.status !== 'canceled' &&
        r.status !== 'idle'
    )

    if (pendingRide) {
      if (!isTracking) {
        startTracking('RIDE')
      }
      setCurrentMissionId(pendingRide.id as string)
      setCurrentRide(pendingRide)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (!driver) return

    resolveCurrentRide()
  }, [currentMissionId])

  useEffect(() => {
    if (!driver) return

    if (!currentMissionId) {
      stopTracking()
      return
    }
  }, [currentMissionId])

  return (
    <TrackRideContext.Provider
      value={{
        currentRide,
        isLoading,
        resolveCurrentRide
      }}
    >
      {children}
    </TrackRideContext.Provider>
  )
}
