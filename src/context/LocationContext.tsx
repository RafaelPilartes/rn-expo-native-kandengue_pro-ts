// src/contexts/LocationContext.tsx
import React, { createContext, useState, useRef, useEffect } from 'react'
import { Linking } from 'react-native'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { getAddressFromCoords } from '@/services/google/googleApi'
import { BACKGROUND_LOCATION_TASK } from '@/services/location/BackgroundLocationTask'
import {
  TrackingMode,
  TRACKING_CONFIGS,
  determineTrackingMode
} from '@/types/trackingTypes'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useDriversViewModel } from '@/viewModels/DriverViewModel'
import LocationDisclosureModal from '@/components/modals/LocationDisclosureModal'
import { useAlert } from '@/context/AlertContext'

type Coords = { latitude: number; longitude: number }

interface LocationContextType {
  location: Coords | null
  address: string | null
  isTracking: boolean
  trackingMode: TrackingMode
  error: string | null
  isLoading: boolean
  isGettingAddress: boolean
  missingPermission: boolean
  isCheckingPermissions: boolean

  requestCurrentLocation: () => Promise<Coords | null>
  startTracking: (mode: TrackingMode) => Promise<void>
  stopTracking: () => Promise<void>
  fetchAddress: (coords?: Coords) => Promise<void>
  clearError: () => void
  getCurrentTrackingMode: () => TrackingMode
  triggerPermissionFlow: () => void
  requestPermission: () => Promise<boolean>
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
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Explicit Disclosure State
  const [showDisclosure, setShowDisclosure] = useState(false)
  const [missingPermission, setMissingPermission] = useState(false)

  const watchRef = useRef<Location.LocationSubscription | null>(null)

  const { showAlert } = useAlert()

  const { driver, currentMissionId } = useAuthStore()
  const { updateDriver } = useDriversViewModel()

  // --------------------------------------------------------
  // 1) Permission Request Logic
  // --------------------------------------------------------
  const checkInitialPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync()

      // Update missingPermission based on current status
      setMissingPermission(status !== 'granted')
    } catch (error) {
      console.warn('Error checking initial location permissions:', error)
      // On error, assume permission is missing to be safe
      setMissingPermission(true)
    } finally {
      setIsCheckingPermissions(false)
    }
  }

  useEffect(() => {
    if (driver) {
      checkInitialPermissions()
    }
  }, [driver])

  // Public method to start the flow
  const triggerPermissionFlow = () => {
    setShowDisclosure(true)
  }

  const handleAcceptDisclosure = async () => {
    setShowDisclosure(false)
    // Wait for modal to close (iOS fix)
    setTimeout(async () => {
      await requestInternalPermission()
    }, 500)
  }

  const requestInternalPermission = async (): Promise<boolean> => {
    try {
      // 1. Check current status first
      const { status: existingStatus, canAskAgain } =
        await Location.getForegroundPermissionsAsync()

      // 2. If already granted, we are good
      if (existingStatus === 'granted') {
        setMissingPermission(false)
        return true
      }

      // 3. If denied and cannot ask again (blocked), open settings
      if (existingStatus === 'denied' && !canAskAgain) {
        showAlert({
          title: 'Permissão Negada',
          message:
            'A permissão de localização foi negada permanentemente. Por favor, ative nas configurações do app.',
          type: 'error',
          buttons: [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configurações',
              onPress: () => Linking.openSettings()
            }
          ]
        })
        setMissingPermission(true)
        return false
      }

      // 4. Request Permission
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync()

      if (newStatus !== 'granted') {
        setError('Permissão de localização necessária.')
        setMissingPermission(true)
        return false
      }

      setMissingPermission(false)

      // 5. Check background permission (optional, separate flow usually)
      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync()
      if (bgStatus !== 'granted') {
        console.warn('Background permission denied')
      }

      return true
    } catch (e) {
      setError('Erro ao solicitar permissão.')
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

    const ok = await requestInternalPermission()
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
        // fetchAddress(coords) <- REMOVED to save Geocoding API costs
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

    const ok = await requestInternalPermission()
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

    // Stop Background Updates — guard against task not being registered
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      )
      if (isRegistered) {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
          BACKGROUND_LOCATION_TASK
        )
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        }
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
        requestPermission: requestInternalPermission, // Exposed for legacy/internal use if needed
        triggerPermissionFlow, // The new main entry point
        missingPermission,
        isCheckingPermissions,
        startTracking,
        stopTracking,
        fetchAddress,
        clearError,
        getCurrentTrackingMode
      }}
    >
      {children}
      <LocationDisclosureModal
        visible={showDisclosure}
        onAccept={handleAcceptDisclosure}
      />
    </LocationContext.Provider>
  )
}
