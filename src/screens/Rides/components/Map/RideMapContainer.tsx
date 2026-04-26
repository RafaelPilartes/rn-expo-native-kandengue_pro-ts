import React, { useEffect, useMemo } from 'react'
import { StyleSheet, Platform } from 'react-native'
import MapView, { Marker, Polyline } from '@/components/map/MapView'
import { RideInterface } from '@/interfaces/IRide'
import { RideStatusType } from '@/types/enum'
import type { RouteInfo } from '@/hooks/ride/useRideSummary'

type LatLng = { latitude: number; longitude: number }

interface RideMapContainerProps {
  mapRef: React.RefObject<any>
  userLocation: LatLng | null
  currentRide: RideInterface | null
  rideStatus: RideStatusType
  route: RouteInfo
  driverRoute: RouteInfo
}

export const RideMapContainer: React.FC<RideMapContainerProps> = ({
  mapRef,
  userLocation,
  currentRide,
  rideStatus,
  route,
  driverRoute
}) => {
  // Build markers with proper colors
  const markers = useMemo(() => {
    const list: Marker[] = []

    // Driver marker (blue) — the driver IS the user
    if (userLocation) {
      const marker: any = {
        id: 'driver-location',
        coordinates: userLocation,
        title: 'Sua Localização'
      }
      if (Platform.OS === 'ios') {
        marker.tintColor = '#007AFF'
        marker.systemImage = 'car.fill'
      } else {
        marker.color = '#007AFF'
      }
      marker.snippet = 'Motorista'
      list.push(marker)
    }

    // Pickup marker (green)
    const showPickup = ['idle', 'driver_on_the_way', 'arrived_pickup'].includes(rideStatus)
    if (showPickup && currentRide) {
      const marker: any = {
        id: 'pickup',
        coordinates: {
          latitude: currentRide.pickup.latitude,
          longitude: currentRide.pickup.longitude
        },
        title: 'Local de Recolha'
      }
      if (Platform.OS === 'ios') {
        marker.tintColor = '#03af5f'
        marker.systemImage = 'mappin.circle.fill'
      } else {
        marker.color = '#03af5f'
      }
      list.push(marker)
    }

    // Dropoff marker (red)
    const showDropoff = ['idle', 'driver_on_the_way', 'arrived_pickup', 'picked_up', 'arrived_dropoff'].includes(rideStatus)
    if (showDropoff && currentRide) {
      const marker: any = {
        id: 'dropoff',
        coordinates: {
          latitude: currentRide.dropoff.latitude,
          longitude: currentRide.dropoff.longitude
        },
        title: 'Local de Entrega'
      }
      if (Platform.OS === 'ios') {
        marker.tintColor = '#EF4444'
        marker.systemImage = 'flag.fill'
      } else {
        marker.color = '#EF4444'
      }
      list.push(marker)
    }

    return list
  }, [userLocation, currentRide, rideStatus])

  // Polylines by status
  const polylines = useMemo(() => {
    const list: Polyline[] = []

    switch (rideStatus) {
      // Preview: full route pickup → dropoff (light green)
      case 'idle': {
        if (route.coords.length > 0) {
          list.push({
            id: 'routePreview',
            coordinates: route.coords,
            color: '#86EFAC',
            width: 3
          })
        }
        break
      }

      // Driver heading to pickup: blue driver route + gray context
      case 'driver_on_the_way': {
        if (driverRoute.coords.length > 0) {
          list.push({
            id: 'driverToPickup',
            coordinates: driverRoute.coords,
            color: '#007AFF',
            width: 5
          })
        }
        if (route.coords.length > 0) {
          list.push({
            id: 'routeContext',
            coordinates: route.coords,
            color: '#D1D5DB',
            width: 3
          })
        }
        break
      }

      // At pickup: show upcoming route (green)
      case 'arrived_pickup': {
        if (route.coords.length > 0) {
          list.push({
            id: 'nextSegment',
            coordinates: route.coords,
            color: '#86EFAC',
            width: 4
          })
        }
        break
      }

      // Delivering: driver → dropoff (green, trimmed/shrinking)
      case 'picked_up': {
        if (driverRoute.coords.length > 0) {
          list.push({
            id: 'driverToDropoff',
            coordinates: driverRoute.coords,
            color: '#03af5f',
            width: 5
          })
        }
        break
      }

      default:
        break
    }

    return list
  }, [route.coords, driverRoute.coords, rideStatus])

  // Camera follow driver in real-time
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    const isDriverMoving = ['driver_on_the_way', 'picked_up'].includes(rideStatus)

    if (isDriverMoving) {
      mapRef.current?.setCameraPosition?.({
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        zoom: 16,
        duration: 1000
      })
    }
  }, [rideStatus, userLocation, mapRef])

  // Initial camera
  const initialCamera = useMemo(() => ({
    coordinates: {
      latitude: currentRide
        ? currentRide.pickup.latitude
        : userLocation?.latitude ?? -8.838,
      longitude: currentRide
        ? currentRide.pickup.longitude
        : userLocation?.longitude ?? 13.234
    },
    zoom: 13
  }), [currentRide, userLocation?.latitude, userLocation?.longitude])

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      cameraPosition={initialCamera}
      markers={markers}
      polylines={polylines}
      uiSettings={{
        myLocationButtonEnabled: false
      }}
      properties={{
        isMyLocationEnabled: false,
        isTrafficEnabled: ['driver_on_the_way', 'picked_up'].includes(rideStatus)
      }}
    />
  )
}
