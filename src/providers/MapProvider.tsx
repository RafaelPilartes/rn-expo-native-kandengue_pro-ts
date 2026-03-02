// providers/MapProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
import { AppState } from 'react-native'
import * as Location from 'expo-location'
import { getAddressFromCoords } from '@/services/google/googleApi'
import { Coords, MapContextType } from '@/types/map'

const MapContext = createContext<MapContextType>({} as MapContextType)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapReady, setMapReady] = useState(false)
  const [location, setLocation] = useState<Coords | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapRef = useRef<any>(null)
  const watchRef = useRef<Location.LocationSubscription | null>(null)
  const appStateRef = useRef(AppState.currentState)

  // -----------------------------------------------------
  // 📌 1. Pedir permissão via `expo-location`
  // -----------------------------------------------------
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      const granted = status === 'granted'
      setHasPermission(granted)
      return granted
    } catch (err) {
      console.warn('Erro ao pedir permissão:', err)
      return false
    }
  }

  // -----------------------------------------------------
  // 📌 2. Reverse geocode
  // -----------------------------------------------------
  const fetchAddress = async (coords: Coords) => {
    setIsGettingAddress(true)
    try {
      const addr = await getAddressFromCoords(coords.latitude, coords.longitude)
      setAddress(addr || 'Localização atual')
    } catch (err) {
      console.warn('Erro ao obter endereço:', err)
      setAddress('Endereço não disponível')
    } finally {
      setIsGettingAddress(false)
    }
  }

  // -----------------------------------------------------
  // 📌 3. Obter localização atual — substitui getCurrentPosition
  // -----------------------------------------------------
  const getCurrentLocation = async (): Promise<Coords | null> => {
    setIsLoading(true)
    setError(null)

    const perm = await requestLocationPermission()
    if (!perm) {
      setError('Permissão negada.')
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
      // fetchAddress(coords) <- REMOVED to save Geocoding API costs
      return coords
    } catch (err: any) {
      console.warn('Erro ao obter localização:', err)
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // -----------------------------------------------------
  // 📌 4. Centralizar no usuário
  // -----------------------------------------------------
  const centerOnUser = async () => {
    const coords = location ?? (await getCurrentLocation())
    if (!coords || !mapRef.current) return

    mapRef.current?.setCameraPosition?.({
      coordinates: coords,
      zoom: 15
    })
  }

  // -----------------------------------------------------
  // 📌 5. Tracking — substituindo watchPosition
  // -----------------------------------------------------
  const startTracking = async () => {
    const perm = await requestLocationPermission()
    if (!perm) {
      setError('Permissão negada.')
      return
    }

    if (watchRef.current) {
      watchRef.current.remove()
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5
      },
      pos => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        setLocation(coords)
      }
    )

    setIsTracking(true)
  }

  // -----------------------------------------------------
  // 📌 6. Parar tracking
  // -----------------------------------------------------
  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove()
      watchRef.current = null
    }
    setIsTracking(false)
  }, [])

  // -----------------------------------------------------
  // 📌 7. Mapa pronto
  // -----------------------------------------------------
  const handleMapReady = useCallback(() => {
    setMapReady(true)
    if (location) {
      mapRef.current?.setCameraPosition?.({
        coordinates: location,
        zoom: 15
      })
    }
  }, [location])

  // -----------------------------------------------------
  // 📌 8. Limpar erro
  // -----------------------------------------------------
  const clearError = useCallback(() => setError(null), [])

  // -----------------------------------------------------
  // 📌 9. Buscar localização inicial + Start tracking
  // -----------------------------------------------------
  useEffect(() => {
    getCurrentLocation()
    startTracking()

    return () => stopTracking()
  }, [])

  // -----------------------------------------------------
  // 📌 10. Controlar tracking ao mudar estado do app
  // -----------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === 'active'
      ) {
        if (isTracking) startTracking()
      } else if (next.match(/inactive|background/)) {
        stopTracking()
      }
      appStateRef.current = next
    })

    return () => {
      sub.remove()
      stopTracking()
    }
  }, [isTracking, startTracking, stopTracking])

  return (
    <MapContext.Provider
      value={{
        mapRef,
        mapReady,
        location,
        address,
        isLoading,
        isTracking,
        hasPermission,
        error,
        isGettingAddress,
        getCurrentLocation,
        centerOnUser,
        startTracking,
        stopTracking,
        handleMapReady,
        clearError
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export const useMap = () => useContext(MapContext)
