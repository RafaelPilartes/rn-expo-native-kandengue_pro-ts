import React from 'react'
import { View, Text } from 'react-native'
import {
  Package,
  DoorOpen,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CreditCard
} from 'lucide-react-native'
import { RideDetailsType } from '@/types/ride'
import { getPaymentMethodLabel } from '@/utils/gettersLabels'

interface DeliveryDetailsSectionProps {
  details: RideDetailsType
  userName?: string
  userPhone?: string
}

export const DeliveryDetailsSection: React.FC<DeliveryDetailsSectionProps> = ({
  details,
  userName,
  userPhone
}) => {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
      <View className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Detalhes da Entrega
        </Text>

        {/* Pickup Option Badge */}
        {details.pickup_option && (
          <View className="flex-row items-center px-2 py-1 rounded">
            {details.pickup_option === 'door' ? (
              <DoorOpen size={12} color="#6b7280" />
            ) : (
              <MapPin size={12} color="#6b7280" />
            )}
            <Text className="text-gray-500 text-[10px] font-bold ml-1 uppercase">
              {details.pickup_option === 'door' ? 'Porta a Porta' : 'Rua/Exterior'}
            </Text>
          </View>
        )}
      </View>

      {/* Sender & Receiver */}
      <View className="p-4 flex-row border-b border-gray-100">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center mb-1">
            <ArrowUpRight size={14} color="#60A5FA" />
            <Text className="text-blue-900 font-bold text-xs ml-1">
              Remetente
            </Text>
          </View>
          <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
            {details.sender?.name || userName || 'Não informado'}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            {details.sender?.phone || userPhone || 'Sem contacto'}
          </Text>
        </View>

        <View className="w-[1px] bg-gray-100 mx-2" />

        <View className="flex-1 pl-2">
          <View className="flex-row items-center mb-1">
            <ArrowDownRight size={14} color="#F87171" />
            <Text className="text-red-900 font-bold text-xs ml-1">
              Destinatário
            </Text>
          </View>
          <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
            {details.receiver.name}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            {details.receiver.phone}
          </Text>
        </View>
      </View>

      {/* Package Info */}
      <View className="p-4 flex-row items-start">
        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3 mt-1">
          <Package size={20} color="#6b7280" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 font-bold text-sm mb-0.5">
            {details.item.type}
          </Text>
          <Text className="text-gray-600 text-xs">
            Tamanho:{' '}
            <Text className="font-medium text-gray-800 capitalize">
              {details.item.size}
            </Text>
          </Text>

          {details.item.description && (
            <Text className="text-gray-500 text-[11px] mt-1 leading-snug italic border-l-2 border-gray-200 pl-2">
              "{details.item.description}"
            </Text>
          )}

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className="bg-gray-100 px-2.5 py-1 rounded-full flex-row items-center border border-gray-200">
              <Text className="text-gray-700 text-[10px] font-bold">
                QTD: {details.item.quantity}
              </Text>
            </View>

            {details.item.weight && (
              <View className="bg-orange-50 px-2.5 py-1 rounded-full flex-row items-center border border-orange-100">
                <Text className="text-orange-700 text-[10px] font-bold">
                  PESO: {details.item.weight} kg
                </Text>
              </View>
            )}

            {details.payment_method && (
              <View className="bg-green-50 px-2.5 py-1 gap-2 rounded-full flex-row items-center border border-green-100">
                <CreditCard size={10} color="#15803d" className="mr-1" />
                <Text className="text-green-800 text-[10px] font-bold">
                  {getPaymentMethodLabel(details.payment_method)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Driver Instructions */}
      {details.driver_instructions && (
        <View className="px-4 pb-4">
          <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-row items-start">
            <Info size={16} color="#6b7280" className="mt-0.5" />
            <View className="flex-1 ml-2">
              <Text className="text-gray-900 font-bold text-[11px] uppercase tracking-wider mb-0.5">
                Instruções para o Motorista
              </Text>
              <Text className="text-gray-800 text-xs leading-relaxed">
                {details.driver_instructions}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
