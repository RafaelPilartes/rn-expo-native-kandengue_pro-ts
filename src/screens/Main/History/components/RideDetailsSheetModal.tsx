// src/screens/Main/History/components/RideDetailsSheetModal.tsx
import React, { forwardRef, useMemo } from 'react'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { View, Text, Image } from 'react-native'
import {
  Car,
  Bike,
  Package,
  Clock,
  Route,
  User,
  MapPin,
  CreditCard,
  Phone
} from 'lucide-react-native'
import { RideInterface } from '@/interfaces/IRide'
import { formatMoney } from '@/utils/formattedNumber'
import { formatFullDate } from '@/utils/formatDate'
import StatusTag from './StatusTag'
import { getPaymentMethodLabel } from '@/utils/gettersLabels'

interface RideDetailsSheetModalProps {
  selectedRide: RideInterface | null
  snapPoints: string[]
  onChange: (index: number) => void
}

const RideDetailsSheetModal = forwardRef<
  BottomSheetModal,
  RideDetailsSheetModalProps
>(({ selectedRide, snapPoints, onChange }, ref) => {
  const getTypeIcon = () => {
    if (!selectedRide) return null

    switch (selectedRide.type) {
      case 'car':
        return <Car size={24} color="#000" />
      case 'motorcycle':
        return <Bike size={24} color="#000" />
      case 'delivery':
        return <Package size={24} color="#000" />
      default:
        return <Car size={24} color="#000" />
    }
  }

  const earnings = selectedRide
    ? selectedRide.fare?.payouts?.driver_earnings
    : 0
  const totalFare = selectedRide ? selectedRide.fare?.total : 0

  return (
    <BottomSheetModal
      ref={ref}
      onChange={onChange}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB', width: 40 }}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.3}
        />
      )}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {selectedRide ? (
          <>
            {/* Header: ID & Status */}
            <View className="px-5 pt-2 pb-6 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    ID: {selectedRide.id}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs font-medium">
                  {formatFullDate(
                    selectedRide.created_at,
                    'dd MMM yyyy - HH:mm'
                  )}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-3">
                    {getTypeIcon()}
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-900 capitalize">
                      {selectedRide.type === 'delivery'
                        ? 'Entrega'
                        : selectedRide.type === 'motorcycle'
                          ? 'Viagem de Moto'
                          : 'Viagem de Carro'}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {selectedRide.pickup?.name?.split(',')[0]}
                    </Text>
                  </View>
                </View>
                <StatusTag status={selectedRide.status} />
              </View>
            </View>

            {/* Route Visualization */}
            <View className="px-5 py-6">
              <Text className="text-base font-bold text-gray-900 mb-4">
                Detalhes da Rota
              </Text>

              <View className="relative pl-2">
                {/* Connecting Line */}
                <View className="absolute left-[15px] top-4 bottom-8 w-[2px] bg-gray-200" />

                <View className="flex-row items-start mb-6 z-10">
                  <View className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-500 items-center justify-center mr-3 bg-white">
                    <View className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-xs text-gray-400 font-medium mb-0.5">
                      PONTO DE PARTIDA
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800 leading-snug">
                      {selectedRide.pickup?.name}
                    </Text>
                    {selectedRide.pickup?.description && (
                      <Text className="text-gray-500 text-xs mt-1 bg-gray-50 self-start px-2 py-0.5 rounded">
                        {selectedRide.pickup.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row items-start z-10">
                  <View className="w-8 h-8 rounded-full bg-red-50 border-2 border-red-500 items-center justify-center mr-3 bg-white">
                    <View className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-xs text-gray-400 font-medium mb-0.5">
                      DESTINO FINAL
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800 leading-snug">
                      {selectedRide.dropoff?.name}
                    </Text>
                    {selectedRide.dropoff?.description && (
                      <Text className="text-gray-500 text-xs mt-1 bg-gray-50 self-start px-2 py-0.5 rounded">
                        {selectedRide.dropoff.description}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row mx-5 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 justify-between">
              <View className="flex-row items-center">
                <Clock size={16} color="#6B7280" />
                <View className="ml-2">
                  <Text className="text-xs text-gray-400">Tempo</Text>
                  <Text className="text-sm font-bold text-gray-800">
                    {Math.round((selectedRide.duration || 0) / 60)} min
                  </Text>
                </View>
              </View>

              <View className="w-[1px] h-full bg-gray-200" />

              <View className="flex-row items-center">
                <Route size={16} color="#6B7280" />
                <View className="ml-2">
                  <Text className="text-xs text-gray-400">Distância</Text>
                  <Text className="text-sm font-bold text-gray-800">
                    {selectedRide.distance} km
                  </Text>
                </View>
              </View>

              <View className="w-[1px] h-full bg-gray-200" />

              <View className="flex-row items-center">
                <CreditCard size={16} color="#6B7280" />
                <View className="ml-2">
                  <Text className="text-xs text-gray-400">Pagamento</Text>
                  <Text className="text-sm font-bold text-gray-800">
                    {selectedRide.payment_method
                      ? getPaymentMethodLabel(selectedRide.payment_method)
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Financial Breakdown (Receipt Style) */}
            <View className="mx-5 p-5 bg-white rounded-xl border border-dashed border-gray-300 relative overflow-hidden">
              {/* Decorative circles for "receipt" look */}
              <View className="absolute -left-3 top-1/2 w-6 h-6 bg-gray-50 rounded-full" />
              <View className="absolute -right-3 top-1/2 w-6 h-6 bg-gray-50 rounded-full" />

              <Text className="text-base font-bold text-gray-900 mb-4 text-center">
                Resumo Financeiro
              </Text>

              <View className="space-y-2 mb-4">
                {selectedRide.fare?.breakdown && (
                  <>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Tarifa Base</Text>
                      <Text className="text-gray-900 text-sm">
                        AOA{' '}
                        {formatMoney(selectedRide.fare.breakdown.base_fare, 0)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">
                        Distância ({selectedRide.distance}km)
                      </Text>
                      <Text className="text-gray-900 text-sm">
                        AOA{' '}
                        {formatMoney(
                          selectedRide.fare.breakdown.distance_cost,
                          0
                        )}
                      </Text>
                    </View>
                  </>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">Taxa de Serviço</Text>
                  <Text className="text-gray-900 text-sm">
                    - AOA {formatMoney((totalFare || 0) * 0.1, 0)}
                  </Text>
                </View>
              </View>

              <View className="h-[1px] bg-gray-200 my-2" />

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-900 font-bold text-lg">
                  Seus Ganhos
                </Text>
                <Text className="text-green-600 font-bold text-xl">
                  AOA {formatMoney(earnings, 0)}
                </Text>
              </View>
            </View>

            {/* Delivery Details (Premium) */}
            {selectedRide.type === 'delivery' && selectedRide.details && (
              <View className="mx-5 mt-6">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Detalhes da Entrega
                </Text>

                <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* Package Info */}
                  <View className="p-4 flex-row items-start">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Package size={20} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-blue-900 font-bold text-sm mb-0.5">
                        Encomenda
                      </Text>
                      <Text className="text-gray-700 text-sm font-medium">
                        {selectedRide.details.item.type} •{' '}
                        {selectedRide.details.item.size}
                      </Text>
                      {selectedRide.details.item.description && (
                        <Text className="text-gray-500 text-xs mt-1 leading-snug">
                          {selectedRide.details.item.description}
                        </Text>
                      )}
                      <View className="mt-2 flex-row">
                        <View className="bg-blue-200/50 px-2 py-0.5 rounded text-xs">
                          <Text className="text-blue-800 text-[10px] font-bold">
                            QTD: {selectedRide.details.item.quantity}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="h-[1px] bg-gray-200 mx-4" />

                  {/* Receiver Info */}
                  <View className="p-4 flex-row items-center">
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 border border-blue-100">
                      <User size={20} color="#60A5FA" />
                    </View>
                    <View>
                      <Text className="text-blue-900 font-bold text-sm mb-0.5">
                        Destinatário
                      </Text>
                      <Text className="text-gray-800 text-sm font-medium">
                        {selectedRide.details.receiver.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {selectedRide.details.receiver.phone}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Customer Info */}
            {selectedRide.user && (
              <View className="px-5 mt-6 mb-6">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Cliente
                </Text>
                <View className="bg-gray-50 p-4 rounded-xl flex-row items-center border border-gray-100">
                  {selectedRide.user.photo ? (
                    <Image
                      source={{ uri: selectedRide.user.photo }}
                      className="w-10 h-10 rounded-full mr-3 bg-gray-200"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                      <User size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 text-sm">
                      {selectedRide.user.name || 'Passageiro'}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <View className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5" />
                      <Text className="text-gray-500 text-xs">5.0 (Novo)</Text>
                    </View>
                  </View>
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                    <Phone size={14} color="#166534" />
                  </View>
                </View>
              </View>
            )}

            {/* Cancel Reason */}
            {selectedRide.status === 'canceled' &&
              selectedRide.cancel_reason && (
                <View className="mx-5 mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
                  <Text className="text-red-800 font-bold text-sm mb-1">
                    Corrida Cancelada
                  </Text>
                  <Text className="text-red-600 text-sm">
                    {selectedRide.cancel_reason}
                  </Text>
                </View>
              )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400">Carregando detalhes...</Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

export default RideDetailsSheetModal
