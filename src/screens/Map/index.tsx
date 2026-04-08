// src/screens/Map/index.tsx
import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RideMapContainer } from '@/screens/Rides/components/Map/RideMapContainer'
import { Navigation } from 'lucide-react-native'

// Components
import { AddressDisplay } from './components/AddressDisplay'
import { MyLocationButton } from './components/MyLocationButton'

// Hooks e Providers
import { MapError } from '@/components/map/MapError'
import { useAppProvider } from '@/providers/AppProvider'
import { Alert } from 'react-native'
import { useLocation } from '@/hooks/useLocation'
import { useMap } from '@/providers/MapProvider'

// Mock de Zonas de Alta Demanda (Baseado em Luanda)
const DEMAND_ZONES = [
  {
    lineColor: 'rgba(255, 99, 71, 0.5)',
    color: 'rgba(255, 69, 0, 0.3)',
    lineWidth: 2,
    coordinates: [
      { latitude: -8.845, longitude: 13.28 },
      { latitude: -8.835, longitude: 13.28 },
      { latitude: -8.835, longitude: 13.295 },
      { latitude: -8.845, longitude: 13.295 }
    ]
  },
  {
    lineColor: 'rgba(255, 140, 0, 0.5)',
    color: 'rgba(255, 140, 0, 0.25)',
    lineWidth: 2,
    coordinates: [
      { latitude: -8.825, longitude: 13.26 },
      { latitude: -8.815, longitude: 13.26 },
      { latitude: -8.815, longitude: 13.275 },
      { latitude: -8.825, longitude: 13.275 }
    ]
  }
]

export default function MapScreen() {
  const { handleGoBack } = useAppProvider()

  const [isFollowing, setIsFollowing] = useState(false)

  const {
    location,
    isLoading,
    error: locationError,
    address,
    isGettingAddress
  } = useLocation()

  const { mapRef, centerOnUser } = useMap()

  useEffect(() => {
    if (location) {
      centerOnUser()
    }
  }, [location, centerOnUser])

  if (locationError) {
    console.log('🚨 Erro ao carregar mapa:', locationError)
    return (
      <MapError
        error={locationError}
        onRetry={centerOnUser}
        onGoBack={handleGoBack}
      />
    )
  }

  // UI principal
  return (
    <SafeAreaView className="flex-1 bg-white">
      <RideMapContainer
        mapRef={mapRef}
        userLocation={location}
        currentRide={null}
        location={{
          pickup: {
            latitude: location?.latitude || -8.839987,
            longitude: location?.longitude || 13.289437,
            name: '',
            description: '',
            place_id: ''
          },
          dropoff: {
            latitude: location?.latitude || -8.839987,
            longitude: location?.longitude || 13.289437,
            name: '',
            description: '',
            place_id: ''
          }
        }}
        rideStatus="idle"
        routeCoords={[]}
        routeCoordsDriver={[]}
        markerHeading={0}
        polygons={DEMAND_ZONES}
        zoom={isFollowing ? 18 : 13}
      />

      {/* Top Bar com Endereço */}
      <View
        className="w-full justify-center items-center mt-2 px-4 z-10"
        pointerEvents="box-none"
      >
        <AddressDisplay
          address={address ?? 'Não foi possivel obter o endereço...'}
          isLoading={isGettingAddress}
        />
      </View>

      <View
        style={{ position: 'absolute', bottom: 134, right: 16, zIndex: 10 }}
      >
        <TouchableOpacity
          onPress={() => setIsFollowing(!isFollowing)}
          className={`h-14 px-5 rounded-full flex-row items-center justify-center shadow-lg border border-gray-100 ${isFollowing ? 'bg-green-500' : 'bg-white'}`}
        >
          <Navigation size={20} color={isFollowing ? 'white' : 'black'} />
          <Text
            className={`font-semibold ml-2 ${isFollowing ? 'text-white' : 'text-gray-800'}`}
          >
            {isFollowing ? 'A Navegar' : 'Explorar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', bottom: 24, left: 16, zIndex: 10 }}>
        <MyLocationButton
          isLocating={isLoading}
          onPress={() => {
            centerOnUser()
            setIsFollowing(true)
          }}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  )
}
