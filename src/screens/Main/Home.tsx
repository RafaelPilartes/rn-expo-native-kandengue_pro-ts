// src/screens/Courier/HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, Touchable, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppProvider } from '@/providers/AppProvider'
import Header from '@/components/HomeHeader'
import StatusAlerts from '@/components/StatusAlerts'
import Statistics from '@/components/Statistics'
import RideList from '@/components/RideList'
import { BlackLoadingPage } from '@/components/loadingPage'
import { useLocation } from '@/hooks/useLocation'
import { MapPin, Navigation, RefreshCw } from 'lucide-react-native'
import ROUTES from '@/constants/routes'
import RideCard from '@/components/RideCard'
import { useTrackRide } from '@/hooks/useTrackRide'

export default function HomeScreen() {
  const { resolveCurrentRide } = useTrackRide()

  const {
    currentDriverData,
    rides,
    ridesCount,
    wallet,
    handleIsOnline,
    handleToDocuments,
    handleToWallet,
    handleDetailsRide,
    handleNotifications,
    navigationMainStack
  } = useAppProvider()

  const {
    isLoading: locationLoading,
    location: currentLocation,
    requestCurrentLocation,
    error: locationError,
    address,
    isGettingAddress,
    fetchAddress
  } = useLocation()

  const { currentRide } = useTrackRide()

  // Solicitar localização quando o motorista ficar online
  useEffect(() => {
    if (
      currentDriverData?.is_online &&
      currentDriverData?.status === 'active'
    ) {
      console.log('🚗 Motorista online, solicitando localização...')
      requestCurrentLocation()
    }
  }, [currentDriverData?.is_online, currentDriverData?.status])

  useEffect(() => {
    // setCurrentMissionId(null);
    resolveCurrentRide()
  }, [])

  // 🔹 Abrir mapa para ver localização
  const handleOpenMap = () => {
    if (!currentLocation) {
      Alert.alert('Atenção', 'Localização não disponível no momento.')
      return
    }

    // Navegar para tela do mapa ou abrir app de mapas
    console.log('🗺️ Abrindo mapa com localização:', currentLocation)
    navigationMainStack.navigate(ROUTES.MainTab.MAP)
  }

  const refreshAddress = async () => {
    await fetchAddress()
  }

  if (!currentDriverData) {
    return (
      <BlackLoadingPage
        primaryText="Carregando dados do motorista"
        secondaryText="Por favor, aguarde..."
      />
    )
  }

  if (currentRide) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        {/* Header */}
        <Header
          driver={currentDriverData}
          onToggleOnline={handleIsOnline}
          onNotifications={handleNotifications}
        />

        <View className="mx-5 mt-2">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Tem uma corrida em andamento
          </Text>

          <RideCard
            ride={currentRide}
            onPressDetails={() => handleDetailsRide(currentRide)}
          />
        </View>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-100 m-safe">
      {/* Header */}
      <Header
        driver={currentDriverData}
        onToggleOnline={handleIsOnline}
        onNotifications={handleNotifications}
      />

      {/* Seção de Localização */}
      <View className="mx-5 px-4 py-3 bg-white rounded-2xl">
        <View className="flex-row items-start justify-between">
          {/* Localização */}
          <View className="flex-row items-start flex-1 gap-1">
            {/* Icone */}
            <MapPin size={16} color={address ? '#EF4444' : '#9CA3AF'} />

            {/* Localização */}
            <View className="flex-1">
              {isGettingAddress ? (
                <Text className="text-sm text-gray-500">
                  Obtendo localização...
                </Text>
              ) : address ? (
                <Text
                  className="text-sm text-gray-800 font-medium"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {address}
                </Text>
              ) : (
                <Text className="text-sm text-gray-500">
                  Localização não disponível
                </Text>
              )}

              {/* Status da localização */}
              <Text className="text-xs text-gray-400 mt-1">
                {locationError ? 'Erro na localização' : 'GPS ativo'}
              </Text>
            </View>
          </View>

          {/* Botões de ação */}
          <View className="flex-row items-center gap-2">
            {/* Atualizar localização */}
            <TouchableOpacity
              onPress={refreshAddress}
              disabled={locationLoading || isGettingAddress}
              className={`p-2 rounded-full ${
                isGettingAddress ? 'bg-gray-200' : 'bg-gray-100'
              }`}
            >
              <RefreshCw
                size={16}
                color={
                  locationLoading || isGettingAddress ? '#9CA3AF' : '#6B7280'
                }
              />
            </TouchableOpacity>

            {/* Ver no mapa */}
            {currentLocation && (
              <TouchableOpacity
                onPress={handleOpenMap}
                className="p-2 rounded-full bg-gray-100"
              >
                <Navigation size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Erro de localização */}
        {locationError && !isGettingAddress && (
          <View className="mt-2 flex-row items-center">
            <Text className="text-xs text-red-500 flex-1">{locationError}</Text>
            <TouchableOpacity
              // onPress={handleRequestLocation}
              className="ml-2"
            >
              <Text className="text-xs text-primary-200 font-semibold">
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Alertas de Status */}
      <StatusAlerts
        driver={currentDriverData}
        balance={wallet?.balance || 0}
        onToDocuments={handleToDocuments}
        onToWallet={handleToWallet}
      />

      {/* Estatísticas */}
      <Statistics balance={wallet?.balance || 0} totalRides={ridesCount} />
      {/* Lista de Corridas */}
      <RideList
        driver={currentDriverData}
        rides={rides}
        onToDocuments={handleToDocuments}
        onDetailsRide={handleDetailsRide}
      />
    </SafeAreaView>
  )
}
