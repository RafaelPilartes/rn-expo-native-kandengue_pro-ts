// providers/MapProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback
} from 'react'
import { useLocation } from '@/hooks/useLocation'
import { Coords, MapContextType } from '@/types/map'

const MapContext = createContext<MapContextType>({} as MapContextType)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapReady, setMapReady] = useState(false)
  const {
    location,
    requestCurrentLocation,
    isLoading: locationLoading,
    error: locationError,
    clearError: clearLocationError
  } = useLocation()

  const mapRef = useRef<any>(null)

  // -----------------------------------------------------
  // 📌 1. Centralizar no usuário
  // -----------------------------------------------------
  const centerOnUser = async () => {
    const coords = location ?? (await requestCurrentLocation())
    if (!coords || !mapRef.current) return

    mapRef.current?.setCameraPosition?.({
      coordinates: coords,
      zoom: 15
    })
  }

  // -----------------------------------------------------
  // 📌 2. Centralizar em um ponto específico
  // -----------------------------------------------------
  const centerOnPoint = async (point: Coords) => {
    if (!mapRef.current) return

    mapRef.current?.setCameraPosition?.({
      coordinates: point,
      zoom: 15
    })
  }

  // -----------------------------------------------------
  // 📌 3. Mapa pronto
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

  return (
    <MapContext.Provider
      value={{
        mapRef,
        mapReady,
        isLoading: locationLoading,
        error: locationError,
        centerOnUser,
        centerOnPoint,
        handleMapReady,
        clearError: clearLocationError
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export const useMap = () => useContext(MapContext)
