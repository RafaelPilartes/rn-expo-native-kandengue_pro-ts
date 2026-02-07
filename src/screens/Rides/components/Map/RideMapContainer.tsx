import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { RideInterface } from '@/interfaces/IRide'
import { CustomPlace } from '@/types/places'

type LatLng = {
  latitude: number
  longitude: number
}

type Props = {
  mapRef: React.RefObject<MapView | null>
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
    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: currentRide
            ? currentRide.pickup.latitude
            : location.pickup.latitude,
          longitude: currentRide
            ? currentRide.pickup.longitude
            : location.pickup.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marker da localização atual */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Sua Localização"
            description="Motorista"
            image={require('@/assets/markers/moto.png')}
            rotation={markerHeading}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          />
        )}

        {/* Rota do motorista para a recolha */}
        {(rideStatus === 'idle' || rideStatus === 'driver_on_the_way') && (
          <>
            {routeCoordsDriver.length > 0 && (
              <Polyline
                coordinates={routeCoordsDriver}
                strokeColor="#007AFF"
                strokeWidth={4}
                lineDashPattern={[0]}
              />
            )}
          </>
        )}

        {/* Ponto pickup */}
        {currentRide && (
          <Marker
            coordinate={{
              latitude: currentRide.pickup.latitude,
              longitude: currentRide.pickup.longitude
            }}
            image={require('@/assets/markers/pickup.png')}
            title="Local de Recolha"
            description={currentRide.pickup?.name}
          />
        )}

        {/* Ponto dropoff */}
        {currentRide && (
          <Marker
            coordinate={{
              latitude: currentRide.dropoff.latitude,
              longitude: currentRide.dropoff.longitude
            }}
            image={require('@/assets/markers/dropoff.png')}
            title="Local de Entrega"
            description={currentRide.dropoff?.name}
          />
        )}

        {/* Rota */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#03af5f"
            strokeWidth={4}
          />
        )}
      </MapView>
    )
  }
)

export { RideMapContainer }
