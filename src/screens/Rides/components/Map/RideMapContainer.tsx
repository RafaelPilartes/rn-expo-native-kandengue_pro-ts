import React, { useEffect, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { Polyline } from '@/components/map/MapView'
import { RideInterface } from '@/interfaces/IRide'
import { RideStatusType } from '@/types/enum'
import { useMapMarkers } from './useMapMarkers'
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
  // Use extracted hook for markers (supports custom PNGs and rotation)
  const markers = useMapMarkers({
    pickup: currentRide?.pickup,
    dropoff: currentRide?.dropoff,
    driver: userLocation ? { location: userLocation, heading: 0 } : undefined, // Assuming driver is the user
    rideStatus
  })

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
        duration: 1000 // Smooth animation
      })
    } else if (rideStatus === 'idle' && route.coords.length > 0) {
      // Fit to full route
      mapRef.current?.fitToCoordinates?.(route.coords, {
        edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
        animated: true
      })
    } else if (currentRide?.pickup && ['arrived_pickup', 'arrived_dropoff'].includes(rideStatus)) {
      // Zoom to current location
      mapRef.current?.setCameraPosition?.({
        coordinates: rideStatus === 'arrived_pickup' ? currentRide.pickup : currentRide.dropoff,
        zoom: 18,
        duration: 1000
      })
    }
  }, [rideStatus, userLocation, route.coords, currentRide, mapRef])

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
