// src/screens/Ride/RideSummaryScreen.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, Linking, Platform } from 'react-native'
import MapView from '@/components/map/MapView'

import { useRideSummary } from '@/hooks/useRideSummary'
import { DriverRideSheet } from './components/Cards/DriverRideCard'

import { CustomPlace } from '@/types/places'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { HomeStackParamList } from '@/types/navigation'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import ROUTES from '@/constants/routes'
import { useLocation } from '@/hooks/useLocation'
import { calculateHeading } from '@/helpers/bearing'
import { converter } from '@/utils/converter'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { useAlert } from '@/context/AlertContext'

// New Components
import { RideMapContainer } from './components/Map/RideMapContainer'
import { RideStatusManager } from './components/Status/RideStatusManager'
import { RideModals } from './components/Modals/RideModals'

type RideSummaryScreenRouteParams = {
  id: string
  location: {
    pickup: CustomPlace
    dropoff: CustomPlace
  }
}

export default function RideSummaryScreen() {
  const route = useRoute()

  const { id: rideId, location } = route.params as RideSummaryScreenRouteParams
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>()

  const {
    location: userLocation,
    isLoading: isLoadingUserLocation,
    requestCurrentLocation
  } = useLocation()

  const { showAlert } = useAlert()

  const mapRef = useRef<any>(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [showConfirmationFlow, setShowConfirmationFlow] = useState(false)
  const [isLoadingCompleteRide, setIsLoadingCompleteRide] = useState(false)

  const centerOnUser = async () => {
    const coords = userLocation ?? (await requestCurrentLocation())

    if (!coords) {
      showAlert({
        title: 'Erro',
        message: 'Não foi possível obter localização.',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      return
    }

    mapRef.current?.setCameraPosition?.({
      coordinates: coords,
      zoom: 15
    })
  }

  const {
    loading: isLoadingDataRide,
    ride: currentRide,
    rideTracking,
    routeCoords,
    distance,
    duration,

    // Rota do motorista
    routeCoordsDriver,
    distanceDriver,
    durationDriver,

    // distanceKm,
    fareDetails,
    driver,
    rideStatus,

    // tempo
    currentTime,
    additionalTime,

    // ações
    handleCancelFindRide, // Motorista cancelou a entrega = canceled
    handleConfirmRide, // Motorista confirmou a entrega = driver_on_the_way
    handleArrivedToPickup, // Motorista chegou ao local de recolha = arrived_pickup
    handlePickedUpRide, // Motorista pegou o pacote = picked_up
    handleArrivedToDropoff, // Motorista chegou ao local de entrega = arrived_dropoff
    handleCompletedRide, // Motorista entregou o pacote = completed
    handleCanceledRide, // Motorista cancelou a entrega = canceled
    handleCalculateFareSummary
  } = useRideSummary(rideId)

  const hasDriver = [
    'driver_on_the_way',
    'arrived_pickup',
    'picked_up',
    'arrived_dropoff'
  ].includes(rideStatus)

  const ridePath = rideTracking?.path || []

  // Calculate Heading
  const markerHeading = useMemo(() => {
    if (ridePath.length >= 2) {
      const lastPointTracked = ridePath[ridePath.length - 1]
      const prevPointTracked = ridePath[ridePath.length - 2]
      return calculateHeading(
        prevPointTracked.latitude,
        prevPointTracked.longitude,
        lastPointTracked.latitude,
        lastPointTracked.longitude
      )
    }
    return 0
  }, [ridePath])

  // 🔹 ABRIR NO GPS
  const handleOpenInMaps = () => {
    const destination =
      rideStatus === 'picked_up' ? location.dropoff : location.pickup

    const url = Platform.select({
      ios: `maps://app?saddr=${userLocation?.latitude},${userLocation?.longitude}&daddr=${destination.latitude},${destination.longitude}`,
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
  }

  // 🔹 CONFIRMAR CHEGADA NO LOCAL
  const handleConfirmArrival = async () => {
    if (rideStatus === 'driver_on_the_way') {
      try {
        setShowArrivalModal(false)
        await handleArrivedToPickup()
      } catch (error) {
        showAlert({
          title: 'Erro',
          message: 'Falha ao confirmar chegada',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
      }
    }

    if (rideStatus === 'picked_up') {
      try {
        setShowArrivalModal(false)
        await handleArrivedToDropoff()
      } catch (error) {
        showAlert({
          title: 'Erro',
          message: 'Falha ao confirmar chegada',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
      }
    }
  }

  const handleAcceptRide = async () => {
    try {
      showAlert({
        title: 'Corrida aceita?',
        message: 'Tem certeza que deseja aceitar essa corrida?',
        type: 'info',
        buttons: [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Aceitar',
            onPress: async () => {
              await handleConfirmRide()
                .then(() => {
                  console.log('Corrida aceita com sucesso')
                })
                .catch(error => {
                  console.error('Erro ao aceitar corrida:', error)
                })
            }
          }
        ]
      })
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Falha ao aceitar corrida',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
    }
  }

  // 🔹 CANCELAR CORRIDA
  const handleCancelRide = async (reason: string) => {
    try {
      // setCancelReason(reason);
      setShowCancelModal(false)
      await handleCanceledRide(reason)

      // Navegar de volta
      setTimeout(() => {
        navigation.goBack()
      }, 1000)
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Falha ao cancelar corrida',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
    }
  }

  const handleStartConfirmation = () => {
    setShowConfirmationFlow(true)
  }

  // 🔹 COMPLETAR CORRIDA COM OTP
  const handleCompleteWithOTP = async (otpCode: string, photoUri?: string) => {
    setIsLoadingCompleteRide(true)

    try {
      // Validar OTP antes de completar a corrida
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
      // Aqui você pode validar o OTP com o backend
      const isValidOTP =
        converter.stringToNumber(currentRide?.otp_code) ==
        converter.stringToNumber(otpCode)

      if (isValidOTP) {
        await handleCompletedRide(photoUri)
        // setShowOTPModal(false) // Deprecated/Unused?

        // Navegar para tela de conclusão
        navigation.replace(ROUTES.Rides.FINISHED, {
          details: {
            rideId: currentRide.id,
            pickup: location.pickup,
            dropoff: location.dropoff,
            distance: distance,
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
      console.error('Erro ao validar OTP:', error)
      showAlert({
        title: 'Erro',
        message: 'Falha ao validar código OTP',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
    }
  }

  // 🔹 ATUALIZAR REGIÃO DO MAPA BASEADO NO STATUS
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    let targetLocation = location.pickup

    if (rideStatus === 'picked_up' || rideStatus === 'arrived_dropoff') {
      targetLocation = location.dropoff
    }

    mapRef.current?.setCameraPosition?.({
      coordinates: {
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude
      },
      zoom: 14
    })
  }, [rideStatus, location, userLocation])

  useEffect(() => {
    if (hasDriver) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [rideStatus, navigation])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      bottomSheetRef.current?.close()
    })

    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (!currentRide) return
    if (!driver) return

    if (currentRide.status !== 'idle' && !currentRide.driver) {
      showAlert({
        title: 'Erro',
        message: 'Corrida indisponível',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    }

    if (
      currentRide.status !== 'idle' &&
      currentRide?.driver?.id !== driver.id
    ) {
      if (navigation.canGoBack()) {
        showAlert({
          title: 'Erro',
          message: 'Outro motorista iniciou a corrida',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
        navigation.goBack()
      }
    }
  }, [currentRide])

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* MAPA */}
      <RideMapContainer
        mapRef={mapRef}
        userLocation={userLocation}
        currentRide={currentRide || null}
        location={location}
        rideStatus={rideStatus}
        routeCoords={routeCoords}
        routeCoordsDriver={routeCoordsDriver}
        markerHeading={markerHeading}
      />

      {/* CONTENT */}
      <RideStatusManager
        rideStatus={rideStatus}
        isLoadingDataRide={isLoadingDataRide}
        currentRide={currentRide || null}
        isLoadingUserLocation={isLoadingUserLocation}
        centerOnUser={centerOnUser}
        fareDetails={fareDetails}
        duration={duration}
        handleAcceptRide={handleAcceptRide}
        durationDriver={durationDriver ? String(durationDriver) : ''}
        driver={driver}
        setShowArrivalModal={setShowArrivalModal}
        handleOpenInMaps={handleOpenInMaps}
        currentTime={currentTime}
        additionalTime={String(additionalTime)}
        handlePickedUpRide={handlePickedUpRide}
        distance={distance}
        handleStartConfirmation={handleStartConfirmation}
      />

      {/* DRIVER RIDE SHEET */}
      {currentRide && (
        <DriverRideSheet
          ref={bottomSheetRef}
          rideDetails={currentRide}
          fareDetails={fareDetails}
          distance={distance}
          onCancel={() => setShowCancelModal(true)}
          snapPoints={['18%', '40%']}
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
