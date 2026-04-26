import React from 'react'
import { View, Text } from 'react-native'
import { MapPinned } from 'lucide-react-native'

interface RouteSectionProps {
  pickupDescription: string
  dropoffDescription: string
  distance: string
}

export const RouteSection: React.FC<RouteSectionProps> = ({
  pickupDescription,
  dropoffDescription,
  distance
}) => {
  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-6">
      <View className="flex-row">
        {/* Icons and Line Column */}
        <View className="items-center mr-3 mt-1.5 flex-col">
          <View className="w-3.5 h-3.5 rounded-full bg-green-500 border-[2px] border-green-200 z-10" />
          <View className="w-[2px] flex-1 bg-gray-300 my-1 z-0" />
          <View className="w-3.5 h-3.5 rounded-full bg-primary-200 border-[2px] border-primary-50 z-10" />
        </View>

        {/* Text Column */}
        <View className="flex-1">
          {/* Pickup Text */}
          <View className="pb-5">
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Recolha
            </Text>
            <Text
              className="text-gray-800 font-medium text-sm leading-5"
              numberOfLines={2}
            >
              {pickupDescription}
            </Text>
          </View>

          {/* Dropoff Text */}
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Entrega
            </Text>
            <Text
              className="text-gray-800 font-medium text-sm leading-5"
              numberOfLines={2}
            >
              {dropoffDescription}
            </Text>
          </View>
        </View>
      </View>

      {/* Distance Info below dropoff */}
      <View className="flex-row items-center mt-5 pt-4 border-t border-gray-200/60">
        <MapPinned size={16} color="#6B7280" />
        <Text className="text-gray-500 font-medium ml-2 text-sm">
          Distância total da viagem:
        </Text>
        <Text className="text-gray-900 font-bold ml-auto text-sm">
          {distance}
        </Text>
      </View>
    </View>
  )
}
