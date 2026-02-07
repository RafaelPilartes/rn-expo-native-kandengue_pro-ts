// src/screens/Ride/components/RideStatusDelivering.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Package, Clock, MapPin, User, Navigation } from 'lucide-react-native'

interface PackageInfo {
  type?: string
  description?: string
  size?: string
  quantity?: number
}

interface RideStatusDeliveringProps {
  distanceTraveled: string
  distanceTotal: string
  duration: string
  onPress: () => void
  disabled?: boolean
  packageInfo?: PackageInfo
  onArrived: () => void
}

export const RideStatusDelivering: React.FC<RideStatusDeliveringProps> = ({
  distanceTraveled,
  distanceTotal,
  duration,
  packageInfo,
  onArrived,
  onPress,
  disabled = false
}) => {
  const progress = 50 // Mock - calcular baseado na distância

  return (
    <View className="absolute top-safe left-4 right-4">
      <View className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-900">Em Entrega</Text>
          {/* <View className="bg-orange-100 px-2 py-1 rounded-full">
          <Text className="text-orange-700 text-xs font-medium">
            EM TRÂNSITO
          </Text>
        </View> */}
        </View>

        {/* Estatísticas */}
        <View className="space-y-2 mb-4">
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">Distância á percorrer:</Text>
            </View>
            <Text className="text-gray-900 font-semibold">
              {distanceTraveled}
            </Text>
          </View>
        </View>

        {/* Informações do pacote */}
        {packageInfo && (
          <View className="bg-blue-50 p-3 rounded-lg mb-3">
            <View className="flex-row items-center mb-2">
              <Package size={16} color="#1D4ED8" />
              <Text className="text-blue-800 font-semibold ml-2">Pacote</Text>
            </View>
            <Text className="text-blue-700 text-sm">
              {packageInfo.description || 'Pacote do cliente'}
            </Text>
            {packageInfo.size && (
              <Text className="text-blue-600 text-xs mt-1">
                Tamanho: {packageInfo.size} • Qtd: {packageInfo.quantity || 1}
              </Text>
            )}
          </View>
        )}

        {/* Botão de chegada */}
        <TouchableOpacity
          className="bg-green-500 py-3 rounded-xl flex-row items-center justify-center gap-1"
          onPress={onArrived}
        >
          <Navigation size={18} color="white" className="mr-2" />
          <Text className="text-white font-semibold text-base">
            Cheguei no Local de Entrega
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full flex-row justify-end">
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          className={`
                flex-row items-center px-4 py-3 rounded-full shadow-lg
                ${disabled ? 'bg-gray-400' : 'bg-green-500'}
              `}
        >
          <Navigation size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Abrir no GPS</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
