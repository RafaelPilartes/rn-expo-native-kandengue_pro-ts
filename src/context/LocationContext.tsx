// src/contexts/LocationContext.tsx
import React, { createContext, useState, useRef } from 'react'
import * as Location from 'expo-location'
import { getAddressFromCoords } from '@/services/google/googleApi'
import { BACKGROUND_LOCATION_TASK } from '@/services/location/BackgroundLocationTask'

type Coords = { latitude: number; longitude: number }

interface LocationContextType {
  location: Coords | null
  address: string | null
  isTracking: boolean
  error: string | null
  isLoading: boolean
  isGettingAddress: boolean

  requestCurrentLocation: () => Promise<Coords | null>
  startTracking: () => Promise<void>
  stopTracking: () => void
  fetchAddress: (coords?: Coords) => Promise<void>
  clearError: () => void
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
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchRef = useRef<Location.LocationSubscription | null>(null)

  // --------------------------------------------------------
  // 1) Pedir permissão
  // --------------------------------------------------------
  const requestPermission = async () => {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync()
      if (fgStatus !== 'granted') {
          setError('Permissão de localização em uso negada.')
          return false
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync()
      if (bgStatus !== 'granted') {
          console.warn('Permissão de background negada. O app funcionará apenas em foreground.')
          // Não retornamos false aqui pois o app pode funcionar sem background, mas é bom avisar
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
  // 3) Buscar localização uma única vez
  // --------------------------------------------------------
  const requestCurrentLocation = async (): Promise<Coords | null> => {
    setIsLoading(true)
    setError(null)

    const ok = await requestPermission()
    if (!ok) {
      // setError já definido no requestPermission se falhar foreground
      setIsLoading(false)
      return null
    }

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced // evita timeout no dev client
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
  // 4) Tracking em tempo real
  // --------------------------------------------------------
  const startTracking = async () => {
    if (isTracking) return
    setError(null)

    const ok = await requestPermission()
    if (!ok) {
      return
    }

    setIsTracking(true)

    // A) Foreground Watch (para UI imediata)
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 3
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

    // B) Background Updates
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        if (!hasStarted) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000, // 5 segundos
                distanceInterval: 5, // 5 metros
                showsBackgroundLocationIndicator: true,
                foregroundService: {
                    notificationTitle: "Kandengue Pro",
                    notificationBody: "Rastreando sua corrida em segundo plano..."
                }
            })
        }
    } catch (e) {
        console.warn("Erro ao iniciar background location updates:", e)
    }
  }

  // --------------------------------------------------------
  // 5) Parar tracking
  // --------------------------------------------------------
  const stopTracking = async () => {
    // A) Stop Foreground Watch
    if (watchRef.current) {
      watchRef.current.remove()
      watchRef.current = null
    }
    
    // B) Stop Background Updates
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        }
    } catch (e) {
        console.warn("Erro ao parar background location updates:", e)
    }

    setIsTracking(false)
  }

  // --------------------------------------------------------
  // 6) Limpar erro
  // --------------------------------------------------------
  const clearError = () => setError(null)

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        isTracking,
        error,
        isLoading,
        isGettingAddress,

        requestCurrentLocation,
        startTracking,
        stopTracking,
        fetchAddress,
        clearError
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
