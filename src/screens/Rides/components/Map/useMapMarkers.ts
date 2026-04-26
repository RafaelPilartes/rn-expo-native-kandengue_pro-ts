// src/screens/Rides/components/Map/useMapMarkers.ts
import { useMemo } from 'react'
import { Platform } from 'react-native'
import { useImage } from 'expo-image'
import { Marker } from '@/components/map/MapView'
import { RideStatusType } from '@/types/enum'

type LatLng = { latitude: number; longitude: number }

type MarkerConfig = {
  pickup?: LatLng & { name?: string; description?: string }
  dropoff?: LatLng & { name?: string; description?: string }
  driver?: { location: LatLng; heading: number }
  rideStatus: RideStatusType
}

/**
 * Generates properly colored markers based on ride status.
 *
 * - iOS: Uses SF Symbols (mappin.circle.fill, flag.fill, car.fill) with tintColor
 * - Android: Uses custom PNG icons via expo-image's useImage hook
 */
export function useMapMarkers({
  pickup,
  dropoff,
  driver,
  rideStatus
}: MarkerConfig): Marker[] {
  // Load custom marker icons for Android (expo-maps accepts ImageSource from useImage)
  const pickupIcon = useImage(require('@/assets/markers/pickup.png'))
  const dropoffIcon = useImage(require('@/assets/markers/dropoff.png'))
  const driverIcon = useImage(require('@/assets/markers/driver.png'))

  return useMemo(() => {
    const list: Marker[] = []

    const showPickup = [
      'idle',
      'pending',
      'driver_on_the_way',
      'arrived_pickup'
    ].includes(rideStatus)
    const showDropoff = [
      'idle',
      'pending',
      'picked_up',
      'arrived_dropoff',
      'driver_on_the_way',
      'arrived_pickup'
    ].includes(rideStatus)
    const showDriver =
      !!driver?.location &&
      [
        'driver_on_the_way',
        'arrived_pickup',
        'picked_up',
        'arrived_dropoff'
      ].includes(rideStatus)

    if (showPickup && pickup) {
      const marker: any = {
        id: 'pickup',
        coordinates: {
          latitude: pickup.latitude,
          longitude: pickup.longitude
        },
        title: pickup.name ?? 'Local de Recolha',
        snippet: pickup.description
      }

      if (Platform.OS === 'ios') {
        marker.tintColor = '#10B981'
        marker.systemImage = 'mappin.circle.fill'
      } else if (pickupIcon) {
        marker.icon = pickupIcon
      } else {
        marker.color = '#10B981'
      }

      list.push(marker)
    }

    if (showDropoff && dropoff) {
      const marker: any = {
        id: 'dropoff',
        coordinates: {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude
        },
        title: dropoff.name ?? 'Local de Entrega',
        snippet: dropoff.description
      }

      if (Platform.OS === 'ios') {
        marker.tintColor = '#EF4444'
        marker.systemImage = 'flag.fill'
      } else if (dropoffIcon) {
        marker.icon = dropoffIcon
      } else {
        marker.color = '#EF4444'
      }

      list.push(marker)
    }

    if (showDriver && driver?.location) {
      const marker: any = {
        id: 'driver',
        coordinates: {
          latitude: driver.location.latitude,
          longitude: driver.location.longitude
        },
        title: 'Você'
      }

      if (Platform.OS === 'ios') {
        marker.tintColor = '#3B82F6'
        marker.systemImage = 'car.fill'
      } else if (driverIcon) {
        marker.icon = driverIcon
      } else {
        marker.color = '#3B82F6'
      }

      if (driver.heading !== undefined && driver.heading !== 0) {
        marker.rotation = driver.heading
      }

      list.push(marker)
    }

    return list
  }, [pickup, dropoff, driver, rideStatus, pickupIcon, dropoffIcon, driverIcon])
}
