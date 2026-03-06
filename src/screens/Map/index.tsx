// src/screens/Map/index.tsx
import React, { useEffect, useRef, useState } from 'react'
import { View, Platform } from 'react-native'
import MapView, { Marker } from '@/components/map/MapView'
import { SafeAreaView } from 'react-native-safe-area-context'

// Components
import { AddressDisplay } from './components/AddressDisplay'
import { MyLocationButton } from './components/MyLocationButton'

// Hooks e Providers
import { MapError } from '@/components/map/MapError'
import { useAppProvider } from '@/providers/AppProvider'
import { Alert } from 'react-native'
import { useLocation } from '@/hooks/useLocation'
import { useMap } from '@/providers/MapProvider'

export default function MapScreen() {
  const { handleGoBack } = useAppProvider()

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

  // Prepare markers array (Motorista - Azul)
  const markers: Marker[] = location
    ? [
        {
          coordinates: location,
          title: 'Sua Localização',
          ...(Platform.OS === 'ios'
            ? { tintColor: '#007AFF' }
            : { color: '#007AFF' })
        }
      ]
    : []

  // UI principal
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar com Endereço */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <AddressDisplay
          address={address ?? 'Não foi possivel obter o endereço...'}
          isLoading={isGettingAddress}
        />
      </View>

      {/* Mapa */}
      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          cameraPosition={{
            coordinates: {
              latitude: location?.latitude || -8.839987,
              longitude: location?.longitude || 13.289437
            },
            zoom: 13
          }}
          markers={markers}
          uiSettings={{
            compassEnabled: true,
            ...(Platform.OS === 'ios' ? {} : { zoomControlsEnabled: true })
          }}
          properties={{
            isMyLocationEnabled: false
          }}
        />
      </View>

      <View className="absolute bottom-6 left-4 z-10">
        <MyLocationButton
          isLocating={isLoading}
          onPress={centerOnUser}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  )
}
