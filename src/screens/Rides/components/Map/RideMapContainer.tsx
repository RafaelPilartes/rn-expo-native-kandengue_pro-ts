import React, { memo } from 'react'
import { StyleSheet, Platform } from 'react-native'
import MapView, { Marker } from '@/components/map/MapView'
import { RideInterface } from '@/interfaces/IRide'
import { CustomPlace } from '@/types/places'

type LatLng = {
  latitude: number
  longitude: number
}

type Props = {
  mapRef: React.RefObject<any>
  userLocation: LatLng | null
  currentRide: RideInterface | null
  location: {
    pickup: CustomPlace
    dropoff: CustomPlace
  }
  rideStatus: string
  routeCoords: LatLng[]
  routeCoordsDriver: LatLng[]
  markerHeading: number
}

const RideMapContainer = memo(
  ({
    mapRef,
    userLocation,
    currentRide,
    location,
    rideStatus,
    routeCoords,
    routeCoordsDriver,
    markerHeading
  }: Props) => {
    // Build markers array
    const markers: Marker[] = []

    // User location marker (Motorista - Azul)
    if (userLocation) {
      markers.push({
        id: 'user-location',
        coordinates: userLocation,
        title: 'Sua Localização',
        ...(Platform.OS === 'ios'
          ? { tintColor: '#007AFF', subtitle: 'Motorista' }
          : { color: '#007AFF', snippet: 'Motorista' })
      })
    }

    // Pickup marker (Verde)
    if (currentRide) {
      markers.push({
        id: 'pickup',
        coordinates: {
          latitude: currentRide.pickup.latitude,
          longitude: currentRide.pickup.longitude
        },
        title: 'Local de Recolha',
        ...(Platform.OS === 'ios'
          ? { tintColor: '#03af5f' }
          : { color: '#03af5f' })
      })
    }

    // Dropoff marker (Vermelho)
    if (currentRide) {
      markers.push({
        id: 'dropoff',
        coordinates: {
          latitude: currentRide.dropoff.latitude,
          longitude: currentRide.dropoff.longitude
        },
        title: 'Local de Entrega',
        ...(Platform.OS === 'ios'
          ? { tintColor: '#EF4444' }
          : { color: '#EF4444' })
      })
    }

    // Build polylines array
    const polylines: any[] = []

    if (
      (rideStatus === 'idle' || rideStatus === 'driver_on_the_way') &&
      routeCoordsDriver.length > 0
    ) {
      polylines.push({
        id: 'driver-route',
        coordinates: routeCoordsDriver,
        ...(Platform.OS === 'ios'
          ? { color: '#007AFF', width: 4 }
          : { color: '#007AFF', width: 4 })
      })
    }

    if (routeCoords.length > 0) {
      polylines.push({
        id: 'main-route',
        coordinates: routeCoords,
        ...(Platform.OS === 'ios'
          ? { color: '#03af5f', width: 4 }
          : { color: '#03af5f', width: 4 })
      })
    }

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        cameraPosition={{
          coordinates: {
            latitude: currentRide
              ? currentRide.pickup.latitude
              : location.pickup.latitude,
            longitude: currentRide
              ? currentRide.pickup.longitude
              : location.pickup.longitude
          },
          zoom: 13
        }}
        markers={markers}
        polylines={polylines}
        uiSettings={{
          myLocationButtonEnabled: false
        }}
        properties={{
          isMyLocationEnabled: false
        }}
      />
    )
  }
)

export { RideMapContainer }
