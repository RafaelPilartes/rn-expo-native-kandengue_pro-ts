// src/screens/Ride/components/RideStatusArrival.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { User, Package, Clock, MapPin } from 'lucide-react-native'
import { RideStatusType } from '@/types/enum'

interface RideStatusArrivalProps {
  rideStatus: RideStatusType
  currentTime: string
  additionalTime: string
  onConfirmPickup: () => void
  customerName?: string
}

export const RideStatusArrival: React.FC<RideStatusArrivalProps> = ({
  rideStatus,
  currentTime,
  additionalTime,
  onConfirmPickup,
  customerName
}) => {
  const isAtPickup = rideStatus === 'arrived_pickup'

  return (
    <View className="absolute top-safe left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          {isAtPickup ? 'No Local de Recolha' : 'Aguardando Confirmação'}
        </Text>
        {/* <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-medium">NO LOCAL</Text>
        </View> */}
      </View>

      {/* Status atual */}
      <View className="bg-gray-50 p-3 rounded-lg mb-3">
        <Text className="text-gray-700 text-sm text-center">
          {isAtPickup
            ? 'Você chegou no local de recolha. Aguarde o cliente.'
            : 'Aguardando confirmação de chegada...'}
        </Text>
      </View>

      {/* Informações de tempo */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2">Tempo de espera</Text>
        </View>
        <Text className="text-gray-900 font-semibold">{currentTime}</Text>
      </View>

      {additionalTime && (
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-600">Tempo adicional</Text>
          <Text className="text-orange-600 font-semibold">
            +{additionalTime} min
          </Text>
        </View>
      )}

      {/* Botão de ação */}
      <TouchableOpacity
        className="bg-blue-500 py-3 rounded-xl flex-row items-center justify-center gap-1"
        onPress={onConfirmPickup}
      >
        <Package size={18} color="white" className="mr-2" />
        <Text className="text-white font-semibold text-base">
          {isAtPickup ? 'Pacote Recolhido' : 'Confirmar Chegada'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
