// src/screens/Ride/RideSummaryScreen.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, Alert, Linking, Platform } from 'react-native'
import MapView from 'react-native-maps'

import { useRideSummary } from '@/hooks/useRideSummary'
import { DriverRideSheet } from './components/DriverRideCard'

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

// New Components
import { RideMapContainer } from './components/RideMapContainer'
import { RideStatusManager } from './components/RideStatusManager'
import { RideModals } from './components/RideModals'

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

  const mapRef = useRef<MapView | null>(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  // Estados modais
  // const [showOTPModal, setShowOTPModal] = useState(false) // Seems unused directly in logic, handled by RideConfirmationFlow? Keeping if needed.
  // Actually logic used setShowOTPModal(false) in handleCompleteWithOTP.
  // But RideConfirmationFlow controls its own visibility? No, passed visible prop.
  // rideSummary used: const [showOTPModal, setShowOTPModal] = useState(false) but rendered OTPModal conditionally? No.
  // It rendered RideConfirmationFlow with showConfirmationFlow.
  // Let's check original...
  // Line 65: const [showOTPModal, setShowOTPModal] = useState(false)
  // Line 255: setShowOTPModal(false) in handleCompleteWithOTP
  // Line 31: import { OTPModal }
  // But OTPModal NOT used in JSX.
  // So showOTPModal might be dead code or leftover?
  // Use showConfirmationFlow instead.

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [showConfirmationFlow, setShowConfirmationFlow] = useState(false)
  const [isLoadingCompleteRide, setIsLoadingCompleteRide] = useState(false)

  const centerOnUser = async () => {
    const coords = userLocation ?? (await requestCurrentLocation())

    if (!coords) {
      Alert.alert('Erro', 'Não foi possível obter localização.')
      return
    }

    mapRef.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      },
      800
    )
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
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas')
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
        Alert.alert('Erro', 'Falha ao confirmar chegada')
      }
    }

    if (rideStatus === 'picked_up') {
      try {
        setShowArrivalModal(false)
        await handleArrivedToDropoff()
      } catch (error) {
        Alert.alert('Erro', 'Falha ao confirmar chegada')
      }
    }
  }

  const handleAcceptRide = async () => {
    try {
      Alert.alert(
        'Corrida aceita?',
        'Tem certeza que deseja aceitar essa corrida?',
        [
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
      )
    } catch (error) {
      Alert.alert('Erro', 'Falha ao aceitar corrida')
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
      Alert.alert('Erro', 'Falha ao cancelar corrida')
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
        Alert.alert('Erro', 'Código OTP deve ter 4 dígitos')
        return
      }

      if (!currentRide?.otp_code) {
        Alert.alert('Erro', 'Código OTP não encontrado')
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
        Alert.alert('Erro', 'Código OTP inválido')
      }
    } catch (error) {
      setIsLoadingCompleteRide(false)
      console.error('Erro ao validar OTP:', error)
      Alert.alert('Erro', 'Falha ao validar código OTP')
    }
  }

  // 🔹 ATUALIZAR REGIÃO DO MAPA BASEADO NO STATUS
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    let targetLocation = location.pickup

    if (rideStatus === 'picked_up' || rideStatus === 'arrived_dropoff') {
      targetLocation = location.dropoff
    }

    const region = {
      latitude: targetLocation.latitude,
      longitude: targetLocation.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02
    }

    mapRef.current.animateToRegion(region, 1000)
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
      Alert.alert('Erro', 'Corrida indisponível')
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    }

    if (
      currentRide.status !== 'idle' &&
      currentRide?.driver?.id !== driver.id
    ) {
      if (navigation.canGoBack()) {
        Alert.alert('Erro', 'Outro motorista iniciou a corrida')
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
