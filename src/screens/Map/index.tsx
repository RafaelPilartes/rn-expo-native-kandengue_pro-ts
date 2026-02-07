// src/screens/Map/index.tsx
import React, { useEffect, useRef, useState } from 'react'
import { View, Platform } from 'react-native'
import MapView, { Marker } from '@/components/map/MapView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Components
import { AddressDisplay } from './components/AddressDisplay'
import { MyLocationButton } from './components/MyLocationButton'

// Hooks e Providers
import { MapError } from '@/components/map/MapError'
import { useAppProvider } from '@/providers/AppProvider'
import { Alert } from 'react-native'
import { useLocation } from '@/hooks/useLocation'

export default function MapScreen() {
  const { handleGoBack } = useAppProvider()

  const {
    location,
    isLoading,
    requestCurrentLocation,
    error: locationError,
    address,
    isGettingAddress
  } = useLocation()
  const mapRef = useRef<any>(null)

  const centerOnUser = async () => {
    const coords = location ?? (await requestCurrentLocation())
    if (!coords) {
      Alert.alert('Erro', 'Não foi possível obter localização.')
      return
    }

    mapRef.current?.setCameraPosition?.({
      center: coords,
      zoom: 15
    })
  }

  useEffect(() => {
    if (location) {
      centerOnUser()
    }
  }, [location])

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

  // Prepare markers array
  const markers: Marker[] = location
    ? [
        {
          coordinates: location,
          title: 'Sua Localização',
          ...(Platform.OS === 'ios'
            ? { tintColor: '#EF4444' }
            : { color: '#EF4444' })
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
            center: {
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
