// src/components/RideList.tsx
import React from 'react'
import { View, Text, FlatList } from 'react-native'
import { Car } from 'lucide-react-native'
import { RideInterface } from '@/interfaces/IRide'
import RideCard from './RideCard'

interface RideListProps {
  rides: RideInterface[] | undefined
  onDetailsRide: (ride: RideInterface) => void
}

const RideList: React.FC<RideListProps> = ({ rides, onDetailsRide }) => {
  const renderItem = React.useCallback(
    ({ item }: { item: RideInterface }) => (
      <RideCard ride={item} onPressDetails={() => onDetailsRide(item)} />
    ),
    [onDetailsRide]
  )

  const ItemSeparator = React.useCallback(() => <View className="h-3" />, [])

  // 🔹 Estado quando sem corridas
  if (!rides || rides.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Car size={64} color="gray" />
        <Text className="text-center text-gray-500 mt-4">
          Nenhuma corrida disponível no momento.
        </Text>
        <Text className="text-center text-gray-400 text-sm mt-2">
          Novas corridas aparecerão aqui automaticamente
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 px-5">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          Solicitações ({rides.length})
        </Text>
      </View>

      <FlatList
        data={rides}
        keyExtractor={item => item.id as string}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={3}
        initialNumToRender={5}
      />
    </View>
  )
}

export default RideList
