// src/screens/Courier/HomeScreen.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { Car } from 'lucide-react-native'

import Header from '@/components/HomeHeader'
import Statistics from '@/components/Statistics'
import RideList from '@/components/RideList'
import { BlackLoadingPage } from '@/components/loadingPage'
import RideCard from '@/components/RideCard'
import LocationStatusCard from '@/components/LocationStatusCard'
import PermissionBlocker from '@/components/PermissionBlocker'
import AccountBlocker from '@/components/AccountBlocker'

import { useHomeViewModel } from '@/hooks/useHomeViewModel'
import ROUTES from '@/constants/routes'

export default function HomeScreen() {
  const {
    currentDriverData,
    wallet,
    rides,
    ridesCount,
    currentRide,
    currentLocation,
    address,
    isGettingAddress,
    locationLoading,
    locationError,
    viewState,
    accountIssue,
    actions,
    navigationMainStack
  } = useHomeViewModel()

  // 1. Loading State
  if (viewState === 'LOADING') {
    return (
      <BlackLoadingPage
        primaryText="Carregando dados..."
        secondaryText="Por favor, aguarde..."
      />
    )
  }

  const renderContent = () => {
    switch (viewState) {
      case 'RIDE_ACTIVE':
        return (
          <View className="mx-5 mt-2 flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Tem uma corrida em andamento
            </Text>
            {currentRide && (
              <RideCard
                ride={currentRide}
                onPressDetails={() => actions.handleDetailsRide(currentRide)}
              />
            )}
          </View>
        )

      case 'PERMISSION_DENIED':
        return (
          <PermissionBlocker
            onReqPermission={actions.requestPermission}
            message={
              currentRide
                ? 'Para continuar com a corrida, você precisa permitir o acesso à sua localização.'
                : 'Para receber corridas, você precisa permitir o acesso à sua localização.'
            }
          />
        )

      case 'ACCOUNT_ISSUE':
        return (
          <AccountBlocker
            issueType={accountIssue}
            onToDocuments={actions.handleToDocuments}
            onToWallet={actions.handleToWallet}
          />
        )

      case 'OFFLINE':
        return (
          <View className="flex-1 items-center justify-center px-5">
            <Car size={64} color="gray" />
            <Text className="text-center text-gray-500 mt-4 text-base">
              Você está offline. Ative o modo online para receber solicitações
              de corridas.
            </Text>
          </View>
        )

      case 'READY':
        return (
          <View className="flex-1">
            {/* Seção de Localização */}
            <LocationStatusCard
              address={address}
              isGettingAddress={isGettingAddress}
              isLoading={locationLoading}
              error={locationError}
              onRefresh={actions.fetchAddress}
              onOpenMap={() =>
                navigationMainStack?.navigate(ROUTES.MainTab.MAP)
              }
              hasLocation={!!currentLocation}
            />

            {/* Estatísticas Rápidas */}
            <Statistics
              balance={wallet?.balance || 0}
              totalRides={ridesCount}
            />

            {/* Lista de Corridas */}
            <RideList rides={rides} onDetailsRide={actions.handleDetailsRide} />
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View className="flex-1 bg-gray-100 py-safe">
      <Header
        driver={currentDriverData}
        onToggleOnline={actions.handleIsOnline}
        onToggleInvisible={actions.handleToggleInvisible}
        onNotifications={actions.handleNotifications}
      />

      {renderContent()}
    </View>
  )
}
