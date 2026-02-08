// src/contexts/LocationContext.tsx
import React, { createContext, useState, useRef, useEffect } from 'react'
import * as Location from 'expo-location'
import { getAddressFromCoords } from '@/services/google/googleApi'
import { BACKGROUND_LOCATION_TASK } from '@/services/location/BackgroundLocationTask'
import {
  TrackingMode,
  TRACKING_CONFIGS,
  determineTrackingMode
} from '@/types/trackingTypes'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useDriversViewModel } from '@/viewModels/DriverViewModel'

type Coords = { latitude: number; longitude: number }

interface LocationContextType {
  location: Coords | null
  address: string | null
  isTracking: boolean
  trackingMode: TrackingMode
  error: string | null
  isLoading: boolean
  isGettingAddress: boolean

  requestCurrentLocation: () => Promise<Coords | null>
  startTracking: (mode: TrackingMode) => Promise<void>
  stopTracking: () => Promise<void>
  fetchAddress: (coords?: Coords) => Promise<void>
  clearError: () => void
  getCurrentTrackingMode: () => TrackingMode
}

export const LocationContext = createContext<LocationContextType>(
  {} as LocationContextType
)

export const LocationProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [location, setLocation] = useState<Coords | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('OFFLINE')
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchRef = useRef<Location.LocationSubscription | null>(null)

  const { driver, currentMissionId } = useAuthStore()
  const { updateDriver } = useDriversViewModel()

  // --------------------------------------------------------
  // 1) Permission Request
  // --------------------------------------------------------
  const requestPermission = async () => {
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync()
      if (fgStatus !== 'granted') {
        setError('Permissão de localização em uso negada.')
        return false
      }

      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync()
      if (bgStatus !== 'granted') {
        console.warn(
          'Permissão de background negada. O app funcionará apenas em foreground.'
        )
      }

      return true
    } catch (e) {
      setError('Erro ao solicitar permissão de localização.')
      return false
    }
  }

  // --------------------------------------------------------
  // 2) Reverse Geocoding
  // --------------------------------------------------------
  const fetchAddress = async (coords?: Coords) => {
    setIsGettingAddress(true)

    try {
      const useCoords = coords ?? location
      if (!useCoords) {
        setAddress('Sem coordenadas para obter endereço')
        return
      }

      const result = await getAddressFromCoords(
        useCoords.latitude,
        useCoords.longitude
      )

      setAddress(result || 'Não foi possível obter o endereço')
    } catch (e) {
      console.warn('⚠️ Erro buscando endereço:', e)
      setAddress('Não foi possível obter o endereço')
    } finally {
      setIsGettingAddress(false)
    }
  }

  // --------------------------------------------------------
  // 3) Get Current Location (one-time)
  // --------------------------------------------------------
  const requestCurrentLocation = async (): Promise<Coords | null> => {
    setIsLoading(true)
    setError(null)

    const ok = await requestPermission()
    if (!ok) {
      setIsLoading(false)
      return null
    }

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }

      setLocation(coords)
      fetchAddress(coords)
      return coords
    } catch (e: any) {
      console.warn('Erro getCurrentLocation:', e)
      setError(e?.message || 'Erro ao capturar localização.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // --------------------------------------------------------
  // 4) Update Driver Location in Firestore
  // --------------------------------------------------------
  const updateDriverLocation = async (coords: Coords) => {
    if (!driver?.id) return

    try {
      await updateDriver.mutateAsync({
        id: driver.id,
        driver: {
          current_location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            updated_at: new Date()
          }
        }
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar localização do motorista:', error)
    }
  }

  // --------------------------------------------------------
  // 5) Start Periodic Snapshot (Availability Mode)
  // --------------------------------------------------------
  const startPeriodicSnapshot = async () => {
    const config = TRACKING_CONFIGS.AVAILABILITY

    if (!config.accuracy || !config.timeInterval || !config.distanceInterval) {
      console.error('❌ Configuração de AVAILABILITY inválida')
      return
    }

    console.log('📍 Iniciando rastreamento AVAILABILITY (30s snapshots)')

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: config.accuracy,
        timeInterval: config.timeInterval,
        distanceInterval: config.distanceInterval
      },
      async pos => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }

        setLocation(coords)

        // Update driver location in Firestore
        await updateDriverLocation(coords)
      }
    )
  }

  // --------------------------------------------------------
  // 6) Start Precise Tracking (Ride Mode)
  // --------------------------------------------------------
  const startPreciseTracking = async () => {
    const config = TRACKING_CONFIGS.RIDE

    if (!config.accuracy || !config.timeInterval || !config.distanceInterval) {
      console.error('❌ Configuração de RIDE inválida')
      return
    }

    console.log('🚗 Iniciando rastreamento RIDE (5s precision)')

    // A) Foreground Watch
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: config.accuracy,
        timeInterval: config.timeInterval,
        distanceInterval: config.distanceInterval
      },
      async pos => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        setLocation(coords)
        fetchAddress(coords)
      }
    )

    // B) Background Updates (for ride tracking)
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      )
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: config.accuracy,
          timeInterval: config.timeInterval,
          distanceInterval: config.distanceInterval,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Kandengue Pro',
            notificationBody: 'Rastreando sua corrida em segundo plano...'
          }
        })
      }
    } catch (e) {
      console.warn('Erro ao iniciar background location updates:', e)
    }
  }

  // --------------------------------------------------------
  // 7) Start Tracking (Mode-aware)
  // --------------------------------------------------------
  const startTracking = async (mode: TrackingMode) => {
    console.log(`🎬 [startTracking] Called with mode: ${mode}`)
    console.log(
      `📊 [startTracking] Current state: tracking=${isTracking}, mode=${trackingMode}`
    )

    if (isTracking && trackingMode === mode) {
      console.log(`📍 Já rastreando no modo ${mode}`)
      return
    }

    // Stop existing tracking first
    if (isTracking) {
      console.log(
        `🛑 [startTracking] Stopping existing ${trackingMode} tracking...`
      )
      await stopTracking()
    }

    setError(null)

    const ok = await requestPermission()
    if (!ok) {
      console.log('❌ [startTracking] Permission denied')
      return
    }

    // Set mode BEFORE starting async operations
    console.log(`🎯 [startTracking] Setting tracking mode to: ${mode}`)
    setTrackingMode(mode)
    setIsTracking(true)

    // Handle different modes
    if (mode === 'AVAILABILITY') {
      console.log('📡 [startTracking] Starting AVAILABILITY mode...')
      await startPeriodicSnapshot()
    } else if (mode === 'RIDE') {
      console.log('🚗 [startTracking] Starting RIDE mode...')
      await startPreciseTracking()
    } else {
      // OFFLINE or INVISIBLE - no tracking
      console.log(`🔕 Modo ${mode} - sem rastreamento`)
      setIsTracking(false)
      setTrackingMode(mode)
    }

    console.log(
      `✅ [startTracking] Completed. Mode: ${mode}, Tracking: ${mode === 'AVAILABILITY' || mode === 'RIDE'}`
    )
  }

  // --------------------------------------------------------
  // 8) Stop Tracking
  // --------------------------------------------------------
  const stopTracking = async () => {
    console.log('🛑 Parando rastreamento')

    // Stop Foreground Watch
    if (watchRef.current) {
      watchRef.current.remove()
      watchRef.current = null
    }

    // Stop Background Updates
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      )
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
      }
    } catch (e) {
      console.warn('Erro ao parar background location updates:', e)
    }

    setIsTracking(false)
    setTrackingMode('OFFLINE')
  }

  // --------------------------------------------------------
  // 9) Get Current Tracking Mode (helper)
  // --------------------------------------------------------
  const getCurrentTrackingMode = (): TrackingMode => {
    return trackingMode
  }

  // --------------------------------------------------------
  // 10) Clear Error
  // --------------------------------------------------------
  const clearError = () => setError(null)

  // --------------------------------------------------------
  // 11) Auto-switch tracking mode based on driver state
  // --------------------------------------------------------
  useEffect(() => {
    console.log('🔄 [LocationContext] useEffect triggered', {
      hasDriver: !!driver,
      driver: driver,
      driverId: driver?.id,
      is_online: driver?.is_online,
      is_invisible: driver?.is_invisible,
      currentMissionId,
      currentTrackingMode: trackingMode,
      isCurrentlyTracking: isTracking
    })

    if (!driver) {
      console.log('⚠️ [LocationContext] No driver, stopping tracking')
      if (isTracking) stopTracking()
      return
    }

    const mode = determineTrackingMode(
      driver.is_online,
      driver.is_invisible,
      currentMissionId
    )

    console.log(`🎯 [LocationContext] Mode determined: ${mode}`)
    console.log(
      `📊 [LocationContext] Current state: tracking=${isTracking}, mode=${trackingMode}`
    )

    if (mode === 'RIDE' || mode === 'AVAILABILITY') {
      console.log(`✅ [LocationContext] Starting ${mode} tracking...`)
      startTracking(mode)
    } else {
      // OFFLINE or INVISIBLE
      console.log(
        `🛑 [LocationContext] Mode is ${mode}, checking if need to stop...`
      )
      if (isTracking) {
        console.log('🛑 [LocationContext] Stopping tracking')
        stopTracking()
      } else {
        console.log(
          'ℹ️ [LocationContext] Already not tracking, no action needed'
        )
      }
    }
  }, [driver?.is_online, driver?.is_invisible, currentMissionId])

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        isTracking,
        trackingMode,
        error,
        isLoading,
        isGettingAddress,

        requestCurrentLocation,
        startTracking,
        stopTracking,
        fetchAddress,
        clearError,
        getCurrentTrackingMode
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
