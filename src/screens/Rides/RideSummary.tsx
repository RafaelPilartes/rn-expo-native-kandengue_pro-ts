// src/screens/Rides/RideSummary.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { BackHandler, Linking, Platform, Vibration } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

// Hooks
import { useRideSummary } from '@/hooks/ride/useRideSummary'
import { useAlert } from '@/context/AlertContext'
import { useMap } from '@/providers/MapProvider'

// Types
import { HomeStackParamList } from '@/types/navigation'
import { CustomPlace } from '@/types/places'
import { RideFareInterface } from '@/interfaces/IRideFare'
import ROUTES from '@/constants/routes'
import { converter } from '@/utils/converter'

// Components
import { RideMapContainer } from './components/Map/RideMapContainer'
import { RideStatusManager } from './components/Status/RideStatusManager'
import { RideModals } from './components/Modals/RideModals'
import { DriverRideSheet } from './components/Cards/DriverRideCard'

type RideSummaryScreenRouteParams = {
  id: string
  location: {
    pickup: CustomPlace
    dropoff: CustomPlace
  }
}

export default function RideSummaryScreen() {
  const routeNav = useRoute()
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const { showAlert } = useAlert()
  const { mapRef, centerOnUser } = useMap()

  const { id: rideId, location } = routeNav.params as RideSummaryScreenRouteParams
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  // Local UI state
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [showConfirmationFlow, setShowConfirmationFlow] = useState(false)
  const [isLoadingCompleteRide, setIsLoadingCompleteRide] = useState(false)

  // Unified hook — single source of truth (no duplicate useLocation!)
  const {
    loading,
    isLoadingUserLocation,
    rideStatus,
    currentRide,
    route,
    driverRoute,
    driver,
    driverData,
    fareDetails,
    waitTimer,
    actions
  } = useRideSummary(rideId)

  const hasDriver = [
    'driver_on_the_way',
    'arrived_pickup',
    'picked_up',
    'arrived_dropoff'
  ].includes(rideStatus)

  // ─── Actions ──────────────────────────────────────────

  const handleOpenInMaps = useCallback(() => {
    const destination =
      rideStatus === 'picked_up' ? location.dropoff : location.pickup

    const url = Platform.select({
      ios: `maps://app?saddr=${driver.location?.latitude},${driver.location?.longitude}&daddr=${destination.latitude},${destination.longitude}`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}`
    })

    if (url) {
      Linking.openURL(url).catch(() => {
        showAlert({
          title: 'Erro',
          message: 'Não foi possível abrir o aplicativo de mapas',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
      })
    }
  }, [rideStatus, location, driver.location, showAlert])

  const handleConfirmArrival = useCallback(async () => {
    try {
      if (rideStatus === 'driver_on_the_way') {
        setShowArrivalModal(false)
        await actions.arrivedPickup()
      }
      if (rideStatus === 'picked_up') {
        setShowArrivalModal(false)
        await actions.arrivedDropoff()
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Falha ao confirmar chegada',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
    }
  }, [rideStatus, actions, showAlert])

  const handleAcceptRide = useCallback(async () => {
    showAlert({
      title: 'Corrida aceita?',
      message: 'Tem certeza que deseja aceitar essa corrida?',
      type: 'info',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await actions.confirmRide()
            } catch (error: any) {
              showAlert({
                title: 'Erro',
                message: error.message || 'Falha ao aceitar corrida',
                type: 'error',
                buttons: [{ text: 'OK' }]
              })
            }
          }
        }
      ]
    })
  }, [actions, showAlert])

  const handleCancelRide = useCallback(
    async (reason: string) => {
      try {
        setShowCancelModal(false)
        await actions.cancelRide(reason)
        // Navigation happens automatically via canceled status detection below
      } catch (error) {
        showAlert({
          title: 'Erro',
          message: 'Falha ao cancelar corrida',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
      }
    },
    [actions, showAlert]
  )

  const handleCompleteWithOTP = useCallback(
    async (otpCode: string, photoUri?: string) => {
      setIsLoadingCompleteRide(true)

      try {
        if (otpCode.length !== 4) {
          showAlert({
            title: 'Erro',
            message: 'Código OTP deve ter 4 dígitos',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
          return
        }

        if (!currentRide?.otp_code) {
          showAlert({
            title: 'Erro',
            message: 'Código OTP não encontrado',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
          return
        }

        const isValidOTP =
          converter.stringToNumber(currentRide.otp_code) ===
          converter.stringToNumber(otpCode)

        if (isValidOTP) {
          // Pass actual distance for max(original, real) fare recalculation
          await actions.completedRide(
            photoUri,
            driverRoute.distanceKm > 0 ? driverRoute.distanceKm : undefined,
            waitTimer.totalMinutes
          )

          navigation.replace(ROUTES.Rides.FINISHED, {
            details: {
              rideId: currentRide.id,
              pickup: location.pickup,
              dropoff: location.dropoff,
              distance: route.distanceText,
              fare: fareDetails as RideFareInterface
            }
          })
        } else {
          setIsLoadingCompleteRide(false)
          showAlert({
            title: 'Erro',
            message: 'Código OTP inválido',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
        }
      } catch (error) {
        setIsLoadingCompleteRide(false)
        showAlert({
          title: 'Erro',
          message: 'Falha ao validar código OTP',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
      }
    },
    [currentRide, actions, navigation, location, route.distanceText, driverRoute.distanceKm, waitTimer.totalMinutes, fareDetails, showAlert]
  )

  // ─── Lifecycle Effects ────────────────────────────────

  // Bottom sheet
  useEffect(() => {
    if (hasDriver) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [rideStatus, hasDriver])

  useEffect(() => {
    const unBlur = navigation.addListener('blur', () => {
      bottomSheetRef.current?.close()
    })
    const unFocus = navigation.addListener('focus', () => {
      if (hasDriver) bottomSheetRef.current?.present()
    })
    return () => {
      unBlur()
      unFocus()
    }
  }, [navigation, hasDriver])

  // Guard: ride taken by another driver
  useEffect(() => {
    if (!currentRide || !driverData) return

    if (currentRide.status !== 'idle' && !currentRide.driver) {
      showAlert({
        title: 'Erro',
        message: 'Corrida indisponível',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      if (navigation.canGoBack()) navigation.goBack()
    }

    if (
      currentRide.status !== 'idle' &&
      currentRide?.driver?.id !== driverData.id
    ) {
      showAlert({
        title: 'Erro',
        message: 'Outro motorista iniciou a corrida',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      if (navigation.canGoBack()) navigation.goBack()
    }
  }, [currentRide, driverData, navigation, showAlert])

  // Vibrate on status change
  useEffect(() => {
    if (!rideId || !rideStatus || rideStatus === 'idle') return
    Vibration.vibrate([0, 100, 50, 100])
  }, [rideStatus, rideId])

  // Prevent accidental back navigation during active ride
  useEffect(() => {
    const backAction = () => {
      if (rideStatus === 'idle') return false

      showAlert({
        title: 'Corrida em andamento',
        message: 'Deseja realmente sair da tela da corrida?',
        type: 'warning',
        buttons: [
          { text: 'Ficar', style: 'cancel' },
          {
            text: 'Sair',
            onPress: () => {
              if (navigation.canGoBack()) navigation.goBack()
            }
          }
        ]
      })
      return true
    }

    const handler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )
    return () => handler.remove()
  }, [rideStatus, navigation, showAlert])

  // ─── Render ───────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* MAP */}
      <RideMapContainer
        mapRef={mapRef}
        userLocation={driver.location}
        driverHeading={driver.heading}
        currentRide={currentRide || null}
        rideStatus={rideStatus}
        route={route}
        driverRoute={driverRoute}
      />

      {/* STATUS CONTENT */}
      <RideStatusManager
        rideData={{
          status: rideStatus,
          ride: currentRide || null,
          loading: loading,
          fareDetails: fareDetails,
          route: route,
          driverRoute: driverRoute,
          driver: driverData,
          waitTimer: waitTimer
        }}
        actions={{
          acceptRide: handleAcceptRide,
          pickedUp: actions.pickedUp,
          startConfirmation: () => setShowConfirmationFlow(true),
          openInMaps: handleOpenInMaps,
          showArrivalModal: setShowArrivalModal
        }}
        ui={{
          isLoadingUserLocation: isLoadingUserLocation,
          centerOnUser: centerOnUser
        }}
      />

      {/* DRIVER BOTTOM SHEET */}
      {currentRide && (
        <DriverRideSheet
          ref={bottomSheetRef}
          rideDetails={currentRide}
          fareDetails={fareDetails}
          distance={route.distanceText}
          onCancel={() => setShowCancelModal(true)}
          snapPoints={['20%', '50%']}
        />
      )}

      {/* MODALS */}
      <RideModals
        showCancelModal={showCancelModal}
        setShowCancelModal={setShowCancelModal}
        handleCancelRide={handleCancelRide}
        showArrivalModal={showArrivalModal}
        setShowArrivalModal={setShowArrivalModal}
        handleConfirmArrival={handleConfirmArrival}
        rideStatus={rideStatus}
        location={location}
        showConfirmationFlow={showConfirmationFlow}
        setShowConfirmationFlow={setShowConfirmationFlow}
        handleCompleteWithOTP={handleCompleteWithOTP}
        isLoadingCompleteRide={isLoadingCompleteRide}
        userId={currentRide?.user?.id ?? null}
      />
    </SafeAreaView>
  )
}
