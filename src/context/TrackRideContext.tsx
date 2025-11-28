// src/contexts/TrackingContext.tsx
import React, { createContext, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useLocation } from '@/hooks/useLocation'
import { useRideTrackingsViewModel } from '@/viewModels/RideTrackingViewModel'
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
  const { location, startTracking, stopTracking, isTracking } = useLocation()
  const {
    createRideTracking,
    updateRideTracking,
    fetchOneRideTrackingByField
  } = useRideTrackingsViewModel()
  const { fetchRideById, fetchAllRidesByField } = useRidesViewModel()

  const [currentRide, setCurrentRide] = useState<RideInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const lastUpdateRef = useRef<number>(0) // throttle controller

  const appendTracking = async (rideId: string) => {
    if (!location) return

    // throttle (1 update a cada 5 segundos)
    const now = Date.now()
    if (now - lastUpdateRef.current < 5000) return
    lastUpdateRef.current = now

    const tracking = await fetchOneRideTrackingByField('ride_id', rideId)
    console.log(tracking)

    const newPath: LiveLocationType = {
      latitude: location?.latitude,
      longitude: location?.longitude,
      timestamp: new Date()
    }

    if (!tracking) {
      await createRideTracking.mutateAsync({
        ride_id: rideId,
        path: [newPath]
      })
      return
    }

    const newTempPath = [...tracking.path, newPath]

    if (tracking) {
      await updateRideTracking.mutateAsync({
        id: tracking.id,
        rideTracking: {
          path: newTempPath
        }
      })
      return
    }
  }

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
        startTracking()
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
        startTracking()
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

    appendTracking(currentMissionId)
  }, [location])

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
