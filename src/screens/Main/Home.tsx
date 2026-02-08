// src/screens/Courier/HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
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
    vehicle,
    handleIsOnline,
    handleToggleInvisible,
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
    console.log('Driver DATA =>', currentDriverData)
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
          onToggleInvisible={handleToggleInvisible}
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
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <Header
        driver={currentDriverData}
        onToggleOnline={handleIsOnline}
        onToggleInvisible={handleToggleInvisible}
        onNotifications={handleNotifications}
      />

      {/* Seção de Localização */}
      <View
        style={[
          styles.locationCard,
          { marginHorizontal: 20, marginBottom: 12 }
        ]}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Ícone */}
          <View style={{ marginTop: 4 }}>
            <MapPin size={20} color={address ? '#059669' : '#9CA3AF'} />
          </View>

          {/* Localização */}
          <View style={{ flex: 1 }}>
            {isGettingAddress ? (
              <Text className="text-sm text-gray-500">
                Obtendo localização...
              </Text>
            ) : address ? (
              <Text
                className="text-base font-semibold text-gray-900 mb-1"
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
            <Text className="text-xs text-gray-500 mt-1">
              {locationError ? 'Toque para atualizar' : '● GPS Ativo'}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View
          style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 }}
        />

        {/* Botões de ação - Touch targets >= 48px */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Atualizar localização */}
          <TouchableOpacity
            onPress={refreshAddress}
            disabled={locationLoading || isGettingAddress}
            style={[styles.actionButton, { flex: 1 }]}
            activeOpacity={0.7}
          >
            <RefreshCw
              size={18}
              color={
                locationLoading || isGettingAddress ? '#9CA3AF' : '#6B7280'
              }
            />
            <Text className="text-sm font-semibold text-gray-700 ml-2">
              Atualizar
            </Text>
          </TouchableOpacity>

          {/* Ver no mapa */}
          {currentLocation && (
            <TouchableOpacity
              onPress={handleOpenMap}
              style={[styles.actionButtonPrimary, { flex: 1 }]}
              activeOpacity={0.7}
            >
              <Navigation size={18} color="#b31a24" />
              <Text className="text-sm font-semibold text-red-800 ml-2">
                Ver Mapa
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Erro de localização */}
        {locationError && !isGettingAddress && (
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text className="text-xs text-red-500 flex-1">{locationError}</Text>
            <TouchableOpacity
              onPress={refreshAddress}
              style={{ marginLeft: 8 }}
            >
              <Text className="text-xs text-red-600 font-semibold">
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Alertas de Status */}
      <StatusAlerts
        driver={currentDriverData}
        wallet={wallet}
        vehicle={vehicle}
        onToDocuments={handleToDocuments}
        onToWallet={handleToWallet}
      />

      {/* Estatísticas */}
      <Statistics balance={wallet?.balance || 0} totalRides={ridesCount} />
      {/* Lista de Corridas */}
      {wallet && (
        <RideList
          driver={currentDriverData}
          rides={rides}
          onToDocuments={handleToDocuments}
          onDetailsRide={handleDetailsRide}
          wallet={wallet}
          vehicle={vehicle}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2424244b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  }
})
