import React from 'react'
import { CustomPlace } from '@/types/places'
import { CancelRideModal } from './CancelRideModal'
import { ArrivalConfirmationModal } from './ArrivalConfirmationModal'
import { RideConfirmationFlow } from './RideConfirmationFlow'

type Props = {
  showCancelModal: boolean
  setShowCancelModal: (show: boolean) => void
  handleCancelRide: (reason: string) => void
  showArrivalModal: boolean
  setShowArrivalModal: (show: boolean) => void
  handleConfirmArrival: () => void
  rideStatus: string
  location: {
    pickup: CustomPlace
    dropoff: CustomPlace
  }
  showConfirmationFlow: boolean
  setShowConfirmationFlow: (show: boolean) => void
  handleCompleteWithOTP: (code: string, photoUri?: string) => void
  isLoadingCompleteRide: boolean
  userId: string | null
}

export const RideModals = ({
  showCancelModal,
  setShowCancelModal,
  handleCancelRide,
  showArrivalModal,
  setShowArrivalModal,
  handleConfirmArrival,
  rideStatus,
  location,
  showConfirmationFlow,
  setShowConfirmationFlow,
  handleCompleteWithOTP,
  isLoadingCompleteRide,
  userId
}: Props) => {
  return (
    <>
      <CancelRideModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelRide}
        isLoading={false}
      />

      <ArrivalConfirmationModal
        visible={showArrivalModal}
        onClose={() => setShowArrivalModal(false)}
        onConfirm={handleConfirmArrival}
        locationType={rideStatus === 'driver_on_the_way' ? 'pickup' : 'dropoff'}
        address={
          rideStatus === 'driver_on_the_way'
            ? location.pickup.description
            : location.dropoff.description
        }
      />

      {/* Modal de Confirmação com Foto e OTP */}
      <RideConfirmationFlow
        visible={showConfirmationFlow}
        onClose={() => setShowConfirmationFlow(false)}
        onConfirm={handleCompleteWithOTP}
        isLoading={isLoadingCompleteRide}
        userId={userId}
      />
    </>
  )
}
