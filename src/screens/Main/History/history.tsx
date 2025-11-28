// src/screens/Main/History/history.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { View, SectionList, Text, ActivityIndicator } from 'react-native'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

// Components
import RideItem from './components/RideItem'
import RideDetailsBottomSheet from './components/RideDetailsSheetModal'

// Hooks e Types
import { useRidesViewModel } from '@/viewModels/RideViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { RideInterface } from '@/interfaces/IRide'
import { formatMoney } from '@/utils/formattedNumber'
import { BaseLoadingPage } from '@/components/loadingPage'
import PageHeader from '@/components/PageHeader'
import { useAppProvider } from '@/providers/AppProvider'

type Section = {
  title: string
  data: RideInterface[]
}

// 🔹 Agrupar corridas por período
const groupRidesByPeriod = (rides: RideInterface[]): Section[] => {
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todayRides: RideInterface[] = []
  const thisWeekRides: RideInterface[] = []
  const earlierRides: RideInterface[] = []

  rides.forEach(ride => {
    if (!ride.created_at) return

    const rideDate = new Date(ride.created_at)

    if (rideDate.toDateString() === today.toDateString()) {
      todayRides.push(ride)
    } else if (rideDate >= oneWeekAgo) {
      thisWeekRides.push(ride)
    } else if (rideDate >= oneMonthAgo) {
      earlierRides.push(ride)
    } else {
      earlierRides.push(ride)
    }
  })

  const sections: Section[] = []

  if (todayRides.length > 0) {
    sections.push({ title: 'Hoje', data: todayRides })
  }

  if (thisWeekRides.length > 0) {
    sections.push({ title: 'Esta Semana', data: thisWeekRides })
  }

  if (earlierRides.length > 0) {
    sections.push({ title: 'Anteriormente', data: earlierRides })
  }

  return sections
}

// 🔹 Calcular totais
const calculateTotals = (rides: RideInterface[]) => {
  const totalEarnings = rides
    .filter(ride => ride.status === 'completed')
    .reduce((sum, ride) => sum + (ride.fare?.payouts?.driver_earnings || 0), 0)

  const totalRides = rides.length

  return { totalEarnings, totalRides }
}

export default function History() {
  const { driver } = useAuthStore()
  const { navigationHomeStack } = useAppProvider()
  const { fetchAllRidesByField } = useRidesViewModel()

  const [rides, setRides] = useState<RideInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<RideInterface | null>(null)
  const [sections, setSections] = useState<Section[]>([])

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

  // 🔹 Agrupar corridas quando mudam
  useEffect(() => {
    const groupedSections = groupRidesByPeriod(rides)
    setSections(groupedSections)
  }, [rides])

  const { totalEarnings, totalRides } = calculateTotals(rides)

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

      {/* Total de corridas e total ganho */}
      <View className="px-4 mb-2 mt-4 flex-row items-center justify-between gap-4">
        {/* Total ganho */}
        <View className="flex-1 flex-col justify-center items-center py-6 bg-white rounded-lg border border-gray-200/40">
          <Text className="text-2xl font-bold text-gray-700">
            AOA {formatMoney(totalEarnings, 0)}
          </Text>
          <Text className="text-sm text-gray-500">Total ganho em corridas</Text>
        </View>

        {/* Total de corridas */}
        <View className="flex-1 flex-col justify-center items-center py-6 bg-white rounded-lg border border-gray-200/40">
          <Text className="text-2xl font-semibold text-gray-700">
            {totalRides}
          </Text>
          <Text className="text-sm text-gray-500">Total de corridas</Text>
        </View>
      </View>

      {rides.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 text-lg text-center mb-4">📝</Text>
          <Text className="text-gray-500 text-center text-lg font-medium mb-2">
            Nenhuma corrida encontrada
          </Text>
          <Text className="text-gray-400 text-center">
            Suas corridas aparecerão aqui quando você completar entregas
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
            <Text className="text-base font-semibold text-gray-700 px-4 mt-4 mb-2">
              {title}
            </Text>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Componente BottomSheet unificado */}
      {selectedRide && (
        <RideDetailsBottomSheet
          ref={bottomSheetModalRef}
          selectedRide={selectedRide}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        />
      )}
    </View>
  )
}
