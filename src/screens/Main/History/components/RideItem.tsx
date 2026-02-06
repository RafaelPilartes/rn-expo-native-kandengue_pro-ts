// src/components/RideItem.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {
  ArrowRight,
  Bike,
  Car,
  Package,
  Clock,
  MapPin,
  User,
  LucideIcon
} from 'lucide-react-native'
import StatusTag from './StatusTag'
import { RideInterface } from '@/interfaces/IRide'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatFullDate } from '@/utils/formatDate'

type Props = {
  item: RideInterface
  onPress?: () => void
}

// 🔹 Definir a interface para o config de ícones
interface IconConfig {
  icon: LucideIcon
  color: string
  bgColor: string
}

// 🔹 Mapeamento de tipos com tipo seguro
const iconConfig: Record<string, IconConfig> = {
  motorcycle: { icon: Bike, color: '#DC2626', bgColor: 'bg-red-100' },
  car: { icon: Car, color: '#2563EB', bgColor: 'bg-blue-100' },
  delivery: { icon: Package, color: '#059669', bgColor: 'bg-green-100' },
  bicycle: { icon: Bike, color: '#D97706', bgColor: 'bg-amber-100' }
}

// 🔹 Tipo para as labels
const typeLabels: Record<string, string> = {
  motorcycle: 'Moto',
  car: 'Carro',
  delivery: 'Entrega',
  bicycle: 'Bicicleta'
}

export default function RideItem({ item, onPress }: Props) {
  // 🔹 Renderizar ícone baseado no tipo de corrida com cores temáticas
  const renderIconeType = () => {
    // Usar type assertion ou fallback seguro
    const rideType = item.type as keyof typeof iconConfig
    const config = iconConfig[rideType] || iconConfig.car
    const IconComponent = config.icon

    return (
      <View
        className={`w-10 h-10 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <IconComponent size={20} color={config.color} />
      </View>
    )
  }

  // 🔹 Formatar data da corrida
  const formatRideDate = (date: Date | undefined) => {
    if (!date) return 'Data não disponível'
    return formatFullDate(date, 'dd/MM/yyyy HH:mm')
  }

  // 🔹 Formatar duração
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
    }
  }

  // 🔹 Formatar distância
  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`
  }

  // 🔹 Obter label do tipo de corrida de forma segura
  const getTypeLabel = () => {
    const rideType = item.type as keyof typeof typeLabels
    return typeLabels[rideType] || 'Carro'
  }

  return (
    <TouchableOpacity
      className="bg-white mx-4 my-2.5 rounded-2xl border border-gray-100" // Subtle shadow + border
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        shadowColor: '#777777ff',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2
      }}
    >
      {/* Header com tipo e status */}
      <View className="flex-row justify-between items-center p-4 pb-3">
        <View className="flex-row items-center">
          {renderIconeType()}
          <View className="ml-3">
            <Text className="text-sm font-bold text-gray-900 capitalize">
              {getTypeLabel()}
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {formatRideDate(item.created_at)}
            </Text>
          </View>
        </View>
        <StatusTag status={item.status} />
      </View>

      {/* Separator */}
      <View className="h-[1px] bg-gray-50 mx-4" />

      {/* Conteúdo principal */}
      <View className="w-full p-4 pt-3">
        {/* Origem e Destino com linha conectora */}
        <View className="w-full mb-4 relative">
          {/* Linha Vertical Conectora */}
          <View className="absolute left-[7px] top-6 bottom-6 w-[2px] bg-gray-100 rounded-full z-0" />

          {/* Pickup */}
          <View className="flex-row items-center mb-3 z-10">
            <View className="w-4 h-4 bg-green-50 rounded-full items-center justify-center border-2 border-green-500 mr-3">
              <View className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-gray-800 leading-tight"
                numberOfLines={1}
              >
                {item.pickup.name}
              </Text>
            </View>
          </View>

          {/* Dropoff */}
          <View className="flex-row items-center z-10">
            <View className="w-4 h-4 bg-red-50 rounded-full items-center justify-center border-2 border-red-500 mr-3">
              <View className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-gray-800 leading-tight"
                numberOfLines={1}
              >
                {item.dropoff.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Stats */}
        <View className="flex-row justify-between items-center mt-1 pt-3 border-t border-gray-50">
          <View className="flex-row items-center gap-4">
            {/* Duração */}
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-md">
              <Clock size={12} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1.5 font-medium">
                {formatDuration(item.duration)}
              </Text>
            </View>

            {/* Distância */}
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-md">
              <MapPin size={12} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1.5 font-medium">
                {formatDistance(item.distance)}
              </Text>
            </View>
          </View>

          {/* Preço */}
          <View className="items-end">
            <Text className="text-base font-bold text-gray-900">
              {formatCurrency(item.fare?.total || 0)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
