// src/screens/Ride/components/ConfirmRideCard.tsx
import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'

type Props = {
  price: string
  duration: string
  isLoading: boolean
  onConfirm: () => void
}

export function ConfirmRideCard({
  price,
  duration,
  isLoading,
  onConfirm
}: Props) {
  return (
    <View className="absolute bottom-safe left-0 right-0 z-10 flex">
      <View className="bg-white flex-col items-start rounded-xl mx-8">
        {/* Preço e duração */}
        <View className="w-full flex-row items-center justify-between p-4">
          {/* Preço */}
          <View className="flex-1 flex-col items-center justify-start p-2 border-r-2 border-slate-400">
            <Text className="text-base text-gray-600 mb-1">Preço:</Text>
            <View className="w-full flex-row items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="red" />
                </>
              ) : (
                <Text className="text-2xl font-semibold text-gray-800">
                  AOA {price}
                </Text>
              )}
            </View>
          </View>

          {/* Rota */}
          <View className="flex-1 flex-col items-center justify-start p-2">
            <Text className="text-base text-gray-600 mb-1">Duração:</Text>
            <View className="w-full flex-row items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="red" />
                </>
              ) : (
                <Text className="text-2xl font-semibold text-gray-800">
                  {duration}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Botão */}
        <TouchableOpacity
          className="w-full bg-primary-200 flex-col items-center gap-2 p-4"
          onPress={onConfirm}
          activeOpacity={0.7}
        >
          <Text className="text-base font-bold text-white">
            Aceitar entrega
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
