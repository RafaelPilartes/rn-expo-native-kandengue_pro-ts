import React from 'react'
import { View } from 'react-native'
import { RideInterface } from '@/interfaces/IRide'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { formatMoney } from '@/utils/formattedNumber'

import { LoadingCard } from '../Cards/LoadingCard'
import { RoutePreviewCard } from '../Cards/RoutePreviewCard'
import { MyLocationButton } from '../Map/MyLocationButton'
import { ConfirmRideCard } from '../Cards/ConfirmRideCard'
import { DriverStatusOverlay } from './DriverStatusOverlay'
import { FloatingActionButton } from '../UI/FloatingActionButton'
import { RideStatusArrival } from './RideStatusArrival'
import { RideStatusDelivering } from './RideStatusDelivering'
import { RideStatusArrivedDestination } from './RideStatusArrivedDestination'

type Props = {
  rideStatus: string
  isLoadingDataRide: boolean
  currentRide: RideInterface | null
  isLoadingUserLocation: boolean
  centerOnUser: () => void
  fareDetails: RideFareInterface | null
  duration: string
  handleAcceptRide: () => void
  durationDriver: string
  driver: any // Replace with proper Driver type if available, using any for now to match usage
  setShowArrivalModal: (show: boolean) => void
  handleOpenInMaps: () => void
  currentTime: string
  additionalTime: string
  handlePickedUpRide: () => void
  distance: string
  handleStartConfirmation: () => void
}

export const RideStatusManager = ({
  rideStatus,
  isLoadingDataRide,
  currentRide,
  isLoadingUserLocation,
  centerOnUser,
  fareDetails,
  duration,
  handleAcceptRide,
  durationDriver,
  driver,
  setShowArrivalModal,
  handleOpenInMaps,
  currentTime,
  additionalTime,
  handlePickedUpRide,
  distance,
  handleStartConfirmation
}: Props) => {
  switch (rideStatus) {
    case 'idle':
      return (
        <>
          {isLoadingDataRide ? (
            <LoadingCard />
          ) : (
            <>
              <RoutePreviewCard
                pickupDescription={currentRide?.pickup?.name || ''}
                dropoffDescription={currentRide?.dropoff?.name || ''}
              />

              <View style={{ position: 'absolute', bottom: 220, left: 28 }}>
                <MyLocationButton
                  isLocating={isLoadingUserLocation}
                  onPress={centerOnUser}
                  disabled={isLoadingUserLocation}
                />
              </View>

              <ConfirmRideCard
                price={formatMoney(fareDetails?.total as number, 0)}
                duration={duration}
                isLoading={isLoadingDataRide}
                onConfirm={handleAcceptRide}
              />
            </>
          )}
        </>
      )

    case 'driver_on_the_way':
      return (
        <>
          <DriverStatusOverlay
            duration={durationDriver}
            driverName={driver?.name || 'Motorista'}
            onArrived={() => setShowArrivalModal(true)}
          />
          <FloatingActionButton
            icon="navigation"
            label="Abrir no GPS"
            onPress={handleOpenInMaps}
            position="top-right"
          />
        </>
      )

    case 'arrived_pickup':
      return (
        <>
          <RideStatusArrival
            rideStatus={rideStatus as any} // Cast if types don't match exactly string
            currentTime={currentTime}
            additionalTime={String(additionalTime)}
            onConfirmPickup={handlePickedUpRide}
            customerName={currentRide?.user?.name}
          />
        </>
      )

    case 'picked_up':
      return (
        <>
          <RideStatusDelivering
            distanceTraveled={distance}
            distanceTotal={distance}
            duration={duration}
            packageInfo={currentRide?.details?.item}
            onArrived={() => setShowArrivalModal(true)}
            onPress={handleOpenInMaps}
          />
        </>
      )

    case 'arrived_dropoff':
      return (
        <>
          <RideStatusArrivedDestination
            onConfirm={handleStartConfirmation}
            packageInfo={currentRide?.details?.item}
          />
        </>
      )

    default:
      return null
  }
}
