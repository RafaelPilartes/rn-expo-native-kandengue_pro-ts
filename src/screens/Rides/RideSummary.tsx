// src/screens/Ride/RideSummaryScreen.tsx
import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Alert, Linking, Platform } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'

import { useRideSummary } from '@/hooks/useRideSummary'
import { RoutePreviewCard } from './components/RoutePreviewCard'
import { ConfirmRideCard } from './components/ConfirmRideCard'
import { DriverRideSheet } from './components/DriverRideCard'

import { CustomPlace } from '@/types/places'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  CommonActions,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { HomeStackParamList } from '@/types/navigation'
import { formatMoney } from '@/utils/formattedNumber'
import { RideStatusArrival } from './components/RideStatusArrival'
import { RideStatusDelivering } from './components/RideStatusDelivering'
import { RideStatusArrivedDestination } from './components/RideStatusArrivedDestination'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { DriverStatusOverlay } from './components/DriverStatusOverlay'
import ROUTES from '@/constants/routes'
import { useLocation } from '@/hooks/useLocation'
import { MyLocationButton } from './components/MyLocationButton'
import { LoadingCard } from './components/LoadingCard'
import { FloatingActionButton } from './components/FloatingActionButton'
import { OTPModal } from './components/OTPModal'
import { CancelRideModal } from './components/CancelRideModal'
import { ArrivalConfirmationModal } from './components/ArrivalConfirmationModal'
import { Text } from 'react-native'
import { RideConfirmationFlow } from './components/RideConfirmationFlow'
import { calculateHeading } from '@/helpers/bearing'
import { converter } from '@/utils/converter'
import { RideFareInterface } from '@/interfaces/IRideFare'

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
  const [showOTPModal, setShowOTPModal] = useState(false)
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

  let markerHeading = 0

  if (ridePath.length >= 2) {
    const lastPointTracked = ridePath[ridePath.length - 1]
    const prevPointTracked = ridePath[ridePath.length - 2]

    markerHeading = calculateHeading(
      prevPointTracked.latitude,
      prevPointTracked.longitude,
      lastPointTracked.latitude,
      lastPointTracked.longitude
    )
  }

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
        setShowOTPModal(false)

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

  function renderContentByStatus() {
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
              rideStatus={rideStatus}
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* MAPA */}
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
            rotation={markerHeading} // rotaciona o marker
            anchor={{ x: 0.5, y: 0.5 }} // mantém centrado
            flat={true} // permite ficar deitado sobre o mapa
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

      {/* CONTENT */}
      {renderContentByStatus()}

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
        userId={currentRide?.user.id ?? null}
      />
    </SafeAreaView>
  )
}
