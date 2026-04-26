// src/hooks/ride/useRideSummary.ts
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWaitTimerByDate } from '../useWaitTimerByDate'
import { useRideRatesViewModel } from '@/viewModels/RideRateViewModel'
import { RideRateEntity } from '@/core/entities/RideRate'
import { useLocation } from '../useLocation'
import { useAppProvider } from '@/providers/AppProvider'
import { DriverInterface } from '@/interfaces/IDriver'
import { VehicleInterface } from '@/interfaces/IVehicle'
import { useRideRealtime } from './useRideRealtime'
import { useRideRoute } from './useRideRoute'
import { useRideFlow } from './useRideFlow'
import { useFareCalculation } from './useFareCalculation'
import { RideStatusType } from '@/types/enum'
import { trimPolylineFromPosition } from '@/helpers/polyline'
import { calculateHeading } from '@/helpers/bearing'

type LatLng = { latitude: number; longitude: number }

export type RouteInfo = {
  coords: LatLng[]
  distanceKm: number
  durationMinutes: number
  distanceText: string
  durationText: string
}

export type DriverInfo = {
  location: LatLng | null
  heading: number
}

export type WaitTimerInfo = {
  formatted: string
  extraMinutes: number
  totalMinutes: number
  elapsedSeconds: number
}

export function useRideSummary(rideId: string) {
  // Core state
  const [loading, setLoading] = useState(true)
  const [rideRates, setRideRates] = useState<RideRateEntity | null>(null)

  // Driver's own location (GPS) — SINGLE subscription for the entire screen
  const {
    location: userLocation,
    isLoading: isLoadingUserLocation,
    startTracking,
    stopTracking
  } = useLocation()

  const { currentDriverData, vehicle } = useAppProvider()

  // Ride data (realtime)
  const { ride, rideTracking, isLoadingRide } = useRideRealtime(rideId)

  // Rates
  const { listenAll: listenRates } = useRideRatesViewModel()

  // Derived ride status — NO duplicated state, NO render lag
  const rideStatus: RideStatusType = ride?.status ?? 'idle'

  // Static route: pickup → dropoff (fetched ONCE, then disabled)
  const [staticRouteCached, setStaticRouteCached] = useState(false)

  const {
    routeCoords,
    distanceKm,
    durationMinutes,
    distance: distanceText,
    duration: durationText
  } = useRideRoute(ride?.pickup, ride?.dropoff, {
    enabled: !staticRouteCached // Only fetch until we have data
  })

  // Mark static route as cached once we have coords
  useEffect(() => {
    if (routeCoords.length > 0 && !staticRouteCached) {
      setStaticRouteCached(true)
    }
  }, [routeCoords.length, staticRouteCached])

  // Driver's current destination depends on ride status
  const driverCurrentDestination = useMemo<LatLng | null>(() => {
    if (!ride) return null
    switch (rideStatus) {
      case 'driver_on_the_way':
        return ride.pickup
      case 'picked_up':
        return ride.dropoff
      default:
        return null
    }
  }, [rideStatus, ride?.pickup, ride?.dropoff])

  // Stable driver position from GPS
  const stableDriverPosition = useMemo<LatLng | null>(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }
    }
    return null
  }, [userLocation?.latitude, userLocation?.longitude])

  // Compute heading from consecutive GPS positions
  const previousPositionRef = useRef<LatLng | null>(null)
  const [driverHeading, setDriverHeading] = useState(0)

  useEffect(() => {
    if (!stableDriverPosition) return

    const prev = previousPositionRef.current
    if (
      prev &&
      (prev.latitude !== stableDriverPosition.latitude ||
        prev.longitude !== stableDriverPosition.longitude)
    ) {
      const heading = calculateHeading(
        prev.latitude,
        prev.longitude,
        stableDriverPosition.latitude,
        stableDriverPosition.longitude
      )
      setDriverHeading(heading)
    }

    previousPositionRef.current = stableDriverPosition
  }, [stableDriverPosition])

  // Driver route: driver position → current destination (throttled, with proper throttle fix)
  const {
    routeCoords: rawDriverRouteCoords,
    distanceKm: driverDistanceKm,
    durationMinutes: driverDurationMinutes,
    distance: driverDistanceText,
    duration: driverDurationText
  } = useRideRoute(stableDriverPosition, driverCurrentDestination)

  // Trim driver polyline (Uber-style shrinking)
  const driverRouteCoords = useMemo(() => {
    if (!stableDriverPosition || rawDriverRouteCoords.length === 0) return []
    return trimPolylineFromPosition(rawDriverRouteCoords, stableDriverPosition)
  }, [rawDriverRouteCoords, stableDriverPosition])

  // Wait timer — freeMinutes from rates directly (no duplicated rateByTime logic)
  const waitTimer = useWaitTimerByDate({
    isWaiting: rideStatus === 'arrived_pickup',
    startDate: ride?.waiting_start_at,
    endDate: ride?.waiting_end_at,
    freeMinutes: rideRates?.day_rates?.wait_time_free_minutes
  })

  // Fare calculation
  const { fareDetails, handleCalculateFareSummary } = useFareCalculation(
    distanceKm,
    waitTimer.totalMinutes ?? 0,
    rideRates ?? null
  )

  // Ride flow actions — pass tracking controls instead of calling useLocation() again
  const {
    confirm: handleConfirmRide,
    arrivedPickup: handleArrivedToPickup,
    pickedUp: handlePickedUpRide,
    arrivedDropoff: handleArrivedToDropoff,
    completed: handleCompletedRide,
    canceled: handleCanceledRide
  } = useRideFlow(rideId, fareDetails, rideRates, { startTracking, stopTracking })

  // Load rates (once) — ViewModel manages listener cleanup internally via refs
  useEffect(() => {
    listenRates((rates: RideRateEntity[]) => {
      if (rates?.[0]) setRideRates(rates[0])
    })
  }, [])

  // Driver info (with vehicle)
  const driverData = useMemo(() => ({
    ...(currentDriverData as DriverInterface),
    vehicle: { ...(vehicle as VehicleInterface) }
  }), [currentDriverData, vehicle])

  // Loading state
  useEffect(() => {
    if (routeCoords.length > 0 && fareDetails) {
      setLoading(false)
    }
  }, [routeCoords, fareDetails])

  // Assemble return objects
  const route: RouteInfo = useMemo(
    () => ({
      coords: routeCoords,
      distanceKm,
      durationMinutes,
      distanceText,
      durationText
    }),
    [routeCoords, distanceKm, durationMinutes, distanceText, durationText]
  )

  const driverRoute: RouteInfo = useMemo(
    () => ({
      coords: driverRouteCoords,
      distanceKm: driverDistanceKm,
      durationMinutes: driverDurationMinutes,
      distanceText: driverDistanceText,
      durationText: driverDurationText
    }),
    [driverRouteCoords, driverDistanceKm, driverDurationMinutes, driverDistanceText, driverDurationText]
  )

  const driver: DriverInfo = useMemo(
    () => ({
      location: stableDriverPosition,
      heading: driverHeading
    }),
    [stableDriverPosition, driverHeading]
  )

  return {
    // State
    loading,
    isLoadingUserLocation,
    rideStatus,
    currentRide: ride,
    rideTracking,
    rideRates,

    // Routes
    route,
    driverRoute,

    // Driver
    driver,
    driverData,

    // Fare
    fareDetails,

    // Wait timer
    waitTimer,

    // Actions
    actions: {
      confirmRide: handleConfirmRide,
      arrivedPickup: handleArrivedToPickup,
      pickedUp: handlePickedUpRide,
      arrivedDropoff: handleArrivedToDropoff,
      completedRide: handleCompletedRide,
      cancelRide: handleCanceledRide,
      calculateFareSummary: handleCalculateFareSummary
    }
  }
}
