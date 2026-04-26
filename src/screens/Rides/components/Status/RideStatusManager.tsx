import React from 'react'
import { View } from 'react-native'
import { RideInterface } from '@/interfaces/IRide'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { RideStatusType } from '@/types/enum'
import { formatMoney } from '@/utils/formattedNumber'
import type { RouteInfo, WaitTimerInfo } from '@/hooks/ride/useRideSummary'

import { LoadingCard } from '../Cards/LoadingCard'
import { RoutePreviewCard } from '../Cards/RoutePreviewCard'
import { MyLocationButton } from '../Map/MyLocationButton'
import { ConfirmRideCard } from '../Cards/ConfirmRideCard'
import { DriverStatusOverlay } from './DriverStatusOverlay'
import { FloatingActionButton } from '../UI/FloatingActionButton'
import { RideStatusArrival } from './RideStatusArrival'
import { RideStatusDelivering } from './RideStatusDelivering'
import { RideStatusArrivedDestination } from './RideStatusArrivedDestination'
import { RideStatusCanceled } from './RideStatusCanceled'

type Props = {
  rideData: {
    status: RideStatusType
    ride: RideInterface | null
    loading: boolean
    fareDetails: RideFareInterface | null
    route: RouteInfo
    driverRoute: RouteInfo
    driver: any
    waitTimer: WaitTimerInfo
  }
  actions: {
    acceptRide: () => void
    pickedUp: () => void
    startConfirmation: () => void
    openInMaps: () => void
    showArrivalModal: (show: boolean) => void
  }
  ui: {
    isLoadingUserLocation: boolean
    centerOnUser: () => void
  }
}

export const RideStatusManager = ({
  rideData: {
    status: rideStatus,
    ride: currentRide,
    loading: isLoadingDataRide,
    fareDetails,
    route,
    driverRoute,
    driver,
    waitTimer
  },
  actions: {
    acceptRide: handleAcceptRide,
    pickedUp: handlePickedUpRide,
    startConfirmation: handleStartConfirmation,
    openInMaps: handleOpenInMaps,
    showArrivalModal: setShowArrivalModal
  },
  ui: {
    isLoadingUserLocation,
    centerOnUser
  }
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
                price={formatMoney(fareDetails?.total || 0, 0)}
                duration={route.durationText}
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
            duration={driverRoute.durationText || ''}
            driverName={driver?.name || 'Motorista'}
            estimatedTime={driverRoute.durationText || ''}
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
            rideStatus={rideStatus as any}
            currentTime={waitTimer.formatted}
            additionalTime={String(waitTimer.extraMinutes)}
            onConfirmPickup={handlePickedUpRide}
            customerName={currentRide?.user?.name || currentRide?.details?.receiver?.name}
          />
        </>
      )

    case 'picked_up':
      return (
        <>
          <RideStatusDelivering
            distanceTraveled={driverRoute.distanceText || ''}
            distanceTotal={route.distanceText || ''}
            duration={driverRoute.durationText || ''}
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

    case 'canceled':
      return <RideStatusCanceled />

    default:
      return null
  }
}
