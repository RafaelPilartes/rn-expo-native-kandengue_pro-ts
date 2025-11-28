// src/screens/Ride/components/DriverStatusOverlay.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Clock, Navigation, User, MapPin } from 'lucide-react-native'

interface DriverStatusOverlayProps {
  duration: string
  driverName: string
  onArrived: () => void
  estimatedTime?: string
}

export const DriverStatusOverlay: React.FC<DriverStatusOverlayProps> = ({
  duration,
  driverName,
  onArrived,
  estimatedTime
}) => {
  return (
    <View className="absolute top-safe left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          A Caminho da Recolha
        </Text>
        {/* <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">
            EM ANDAMENTO
          </Text>
        </View> */}
      </View>

      {/* Informações do motorista
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
          <User size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold">{driverName}</Text>
          <Text className="text-gray-600 text-sm">Motorista</Text>
        </View>
      </View> */}

      {/* Tempo e distância */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Clock size={18} color="#6B7280" />
          <Text className="text-gray-600 ml-2">Tempo estimado</Text>
        </View>
        <Text className="text-gray-900 font-semibold">{duration}</Text>
      </View>

      {/* Instruções */}
      {/* <View className="bg-blue-50 p-3 rounded-lg mb-4">
        <Text className="text-blue-800 text-sm text-center">
          Siga para o local de recolha. Toque em "Cheguei" quando estiver no
          local.
        </Text>
      </View> */}

      {/* Botão de confirmação de chegada */}
      <TouchableOpacity
        className="bg-green-500 py-3 rounded-xl flex-row items-center justify-center gap-1"
        onPress={onArrived}
      >
        <MapPin size={18} color="white" />
        <Text className="text-white font-semibold text-base">
          Cheguei no Local
        </Text>
      </TouchableOpacity>
    </View>
  )
}
