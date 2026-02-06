// src/screens/Main/History/history.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { View, SectionList, Text, ActivityIndicator } from 'react-native'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

// Components
import RideItem from './components/RideItem'
import RideDetailsBottomSheet from './components/RideDetailsSheetModal'

// Hooks e Types
// Hooks e Types
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { RideInterface } from '@/interfaces/IRide'
import { formatMoney } from '@/utils/formattedNumber'
import { BaseLoadingPage } from '@/components/loadingPage'
import PageHeader from '@/components/PageHeader'
import { useAppProvider } from '@/providers/AppProvider'
import { calculateTotals, groupRidesByPeriod } from './utils/historyHelpers'

export default function History() {
  const { driver } = useAuthStore()
  const { navigationHomeStack } = useAppProvider()
  const { fetchAllRidesByField } = useRidesViewModel()

  const [rides, setRides] = useState<RideInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<RideInterface | null>(null)

  // Use useMemo for totals to avoid recalculation on every render
  const { totalEarnings, totalRides } = React.useMemo(
    () => calculateTotals(rides),
    [rides]
  )
  const sections = React.useMemo(() => groupRidesByPeriod(rides), [rides])

  const snapPoints = React.useMemo(() => ['55%', '70%'], [])
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const fetchRides = useCallback(async () => {
    try {
      const ridesResponse = await fetchAllRidesByField(
        'driver.id' as any,
        driver?.id
        // 'status',
        // 'completed',
      )

      if (ridesResponse) {
        setRides(ridesResponse.data)
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 🔹 Carregar corridas do motorista
  useEffect(() => {
    fetchRides()
  }, [])

  const handlePresentModalPress = useCallback((ride: RideInterface) => {
    setSelectedRide(ride)
    bottomSheetModalRef.current?.present()
  }, [])

  const handleSheetChanges = useCallback((index: number) => {
    console.log('BottomSheet index:', index)
  }, [])

  useEffect(() => {
    const unsubscribe = navigationHomeStack.addListener('blur', () => {
      bottomSheetModalRef.current?.close()
    })

    return unsubscribe
  }, [navigationHomeStack])

  if (isLoading && rides.length === 0) {
    return (
      <BaseLoadingPage
        title="Histórico de Corridas"
        primaryText={'Buscando corridas...'}
        canGoBack={false}
      />
    )
  }

  return (
    <View className="flex-1 bg-gray-50 p-safe">
      <PageHeader title="Histórico de Corridas" canGoBack={false} />

      {/* New Premium Dashboard */}
      <View className="px-4 mt-4 mb-2">
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500 font-medium mb-1">
              Ganhos Totais
            </Text>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              AOA {formatMoney(totalEarnings, 0)}
            </Text>
          </View>
          <View className="items-end">
            <View className="bg-blue-50 px-3 py-1.5 rounded-full mb-1">
              <Text className="text-blue-700 font-bold text-xs">
                {totalRides} corridas
              </Text>
            </View>
            <Text className="text-xs text-gray-400">Total realizado</Text>
          </View>
        </View>
      </View>

      {rides.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-300 text-6xl mb-4">📝</Text>
          <Text className="text-gray-800 text-center text-xl font-bold mb-2">
            Nenhuma corrida ainda
          </Text>
          <Text className="text-gray-500 text-center max-w-[250px] leading-relaxed">
            Suas corridas aparecerão aqui assim que você completar a primeira
            entrega.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id as string}
          renderItem={({ item }) => (
            <RideItem
              item={item}
              onPress={() => handlePresentModalPress(item)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-4 mt-6 mb-3 flex-row items-center">
              <View className="w-1 h-4 bg-red-500 rounded-full mr-2" />
              <Text className="text-lg font-bold text-gray-800 tracking-tight">
                {title}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Componente BottomSheet unificado - Always mounted for performance */}
      <RideDetailsBottomSheet
        ref={bottomSheetModalRef}
        selectedRide={selectedRide}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      />
    </View>
  )
}
