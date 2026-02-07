// src/screens/Ride/RideSummary/components/RoutePreviewCard.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

type Props = {
  pickupDescription: string
  dropoffDescription: string
}

export function RoutePreviewCard({
  pickupDescription,
  dropoffDescription
}: Props) {
  return (
    <View className="absolute top-safe left-0 right-0 z-10 flex">
      <View className="bg-white flex-col items-start gap-2 rounded-xl px-4 py-3 mt-10 mx-8">
        <View className="w-full flex-row items-center justify-start">
          {/* circle */}
          <View className="w-3 h-3 bg-green-400 rounded-full mr-2 p-2" />
          {/* Location */}
          <Text className="text-sm font-medium text-gray-700">
            RECOLHA: {pickupDescription}
          </Text>
        </View>

        <View className="w-full flex-row items-center justify-start">
          {/* circle */}
          <View className="w-3 h-3 bg-red-400 rounded-full mr-2 p-2" />
          {/* Location */}
          <Text className="text-sm font-medium text-gray-700">
            ENTREGA: {dropoffDescription}
          </Text>
        </View>
      </View>
    </View>
  )
}
