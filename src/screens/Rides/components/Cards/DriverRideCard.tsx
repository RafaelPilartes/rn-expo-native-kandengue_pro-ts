// src/screens/Ride/components/DriverRideCard.tsx
import {
  MapPinned,
  MessageCircle,
  Phone,
  X,
  Package,
  User,
  CreditCard,
  DoorOpen,
  MapPin,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react-native'
import React, { forwardRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Modal
} from 'react-native'
import { useAlert } from '@/context/AlertContext'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { RideInterface } from '@/interfaces/IRide'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { formatMoney } from '@/utils/formattedNumber'
import { getPaymentMethodLabel } from '@/utils/gettersLabels'

type Props = {
  rideDetails: RideInterface
  fareDetails: RideFareInterface | null
  distance: string
  onCancel: () => void
  onChange?: (index: number) => void
  snapPoints: (string | number)[]
}

export const DriverRideSheet = forwardRef<BottomSheetModal, Props>(
  ({ rideDetails, fareDetails, distance, onCancel, snapPoints }, ref) => {
    const [contactModalVisible, setContactModalVisible] = useState(false)
    const [contactType, setContactType] = useState<'call' | 'message' | null>(
      null
    )
    const { showAlert } = useAlert()

    const handleCall = () => {
      if (rideDetails.user?.phone) {
        setContactType('call')
        setContactModalVisible(true)
      } else {
        showAlert({
          title: 'Erro',
          message: 'Número de telefone não disponível',
          type: 'error'
        })
      }
    }

    const handleMessage = () => {
      if (rideDetails.user?.phone) {
        setContactType('message')
        setContactModalVisible(true)
      } else {
        showAlert({
          title: 'Erro',
          message: 'Número de telefone não disponível',
          type: 'error'
        })
      }
    }

    const getStatusInfo = () => {
      const defaultStyle = {
        color: 'bg-gray-100',
        textColor: 'text-gray-800'
      }

      switch (rideDetails.status) {
        case 'driver_on_the_way':
          return { label: 'A caminho da recolha', ...defaultStyle }
        case 'arrived_pickup':
          return { label: 'No local de recolha', ...defaultStyle }
        case 'picked_up':
          return { label: 'A caminho da entrega', ...defaultStyle }
        case 'arrived_dropoff':
          return { label: 'No local de entrega', ...defaultStyle }
        default:
          return { label: 'A iniciar...', ...defaultStyle }
      }
    }

    const statusInfo = getStatusInfo()

    return (
      <>
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          backgroundStyle={{ borderRadius: 24, backgroundColor: '#ffffff' }}
          handleIndicatorStyle={{
            backgroundColor: '#E5E7EB',
            width: 40,
            height: 4
          }}
        >
          <BottomSheetView className="flex-1 px-5 pt-2 pb-6 bg-white">
            {/* Header: Status & Ride ID */}
            <View className="flex-row justify-between items-center mb-6">
              <View className={`px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                <Text
                  className={`text-xs font-bold uppercase tracking-widest ${statusInfo.textColor}`}
                >
                  {statusInfo.label}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm font-bold">
                #{rideDetails.id}
              </Text>
            </View>

            {/* Client Info */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{
                    uri:
                      rideDetails.user?.photo ||
                      'https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                  }}
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
                <View className="ml-3 flex-1">
                  <Text
                    className="font-bold text-gray-900 text-base"
                    numberOfLines={1}
                  >
                    {rideDetails.user?.name || 'Cliente'}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text
                      className="text-gray-500 text-sm font-medium"
                      numberOfLines={1}
                    >
                      {rideDetails.user?.phone ||
                        rideDetails.user?.email ||
                        'Sem contacto'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact Actions */}
              <View className="flex-row gap-3 ml-2">
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                  onPress={handleMessage}
                >
                  <MessageCircle color="#4B5563" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-green-100 items-center justify-center active:bg-green-200"
                  onPress={handleCall}
                >
                  <Phone color="#16A34A" size={18} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Route Section (Connects Pickup and Dropoff) */}
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
                      {rideDetails.pickup.description}
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
                      {rideDetails.dropoff.description}
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

            {/* Delivery Details Section */}
            {rideDetails.type === 'delivery' && rideDetails.details && (
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
                <View className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Detalhes da Entrega
                  </Text>

                  {/* Pickup Option Badge */}
                  {rideDetails.details.pickup_option && (
                    <View className="flex-row items-center px-2 py-1 rounded">
                      {rideDetails.details.pickup_option === 'door' ? (
                        <DoorOpen size={12} color="#6b7280" />
                      ) : (
                        <MapPin size={12} color="#6b7280" />
                      )}
                      <Text className="text-gray-500 text-[10px] font-bold ml-1 uppercase">
                        {rideDetails.details.pickup_option === 'door'
                          ? 'Porta a Porta'
                          : 'Rua/Exterior'}
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
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      numberOfLines={1}
                    >
                      {rideDetails.details.sender?.name ||
                        rideDetails.user?.name ||
                        'Não informado'}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-0.5">
                      {rideDetails.details.sender?.phone ||
                        rideDetails.user?.phone ||
                        'Sem contacto'}
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
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      numberOfLines={1}
                    >
                      {rideDetails.details.receiver.name}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-0.5">
                      {rideDetails.details.receiver.phone}
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
                      {rideDetails.details.item.type}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      Tamanho:{' '}
                      <Text className="font-medium text-gray-800 capitalize">
                        {rideDetails.details.item.size}
                      </Text>
                    </Text>

                    {rideDetails.details.item.description && (
                      <Text className="text-gray-500 text-[11px] mt-1 leading-snug italic border-l-2 border-gray-200 pl-2">
                        "{rideDetails.details.item.description}"
                      </Text>
                    )}

                    <View className="mt-3 flex-row flex-wrap gap-2">
                      <View className="bg-gray-100 px-2.5 py-1 rounded-full flex-row items-center border border-gray-200">
                        <Text className="text-gray-700 text-[10px] font-bold">
                          QTD: {rideDetails.details.item.quantity}
                        </Text>
                      </View>

                      {rideDetails.details.item.weight && (
                        <View className="bg-orange-50 px-2.5 py-1 rounded-full flex-row items-center border border-orange-100">
                          <Text className="text-orange-700 text-[10px] font-bold">
                            PESO: {rideDetails.details.item.weight} kg
                          </Text>
                        </View>
                      )}

                      {rideDetails.details.payment_method && (
                        <View className="bg-green-50 px-2.5 py-1 gap-2 rounded-full flex-row items-center border border-green-100">
                          <CreditCard
                            size={10}
                            color="#15803d"
                            className="mr-1"
                          />
                          <Text className="text-green-800 text-[10px] font-bold">
                            {getPaymentMethodLabel(
                              rideDetails.details.payment_method
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-1" />

            {/* Footer: Price and Actions */}
            <View className="pt-2 pb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 text-center">
                Valor a Receber
              </Text>
              <Text className="text-gray-900 text-2xl font-bold text-center mb-6 tracking-tight">
                {formatMoney(fareDetails?.total ?? 0)}
              </Text>

              {(rideDetails.status === 'driver_on_the_way' ||
                rideDetails.status === 'arrived_pickup') && (
                <TouchableOpacity
                  className="w-full bg-red-50 py-4 rounded-xl border border-red-100 flex-row justify-center items-center active:bg-red-100"
                  onPress={onCancel}
                >
                  <X color="#DC2626" size={20} strokeWidth={3} />
                  <Text className="text-red-600 font-bold text-sm ml-2">
                    Cancelar Viagem
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Modal Personalizado de Contacto */}
        <Modal
          visible={contactModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setContactModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white w-full rounded-3xl p-6 items-center">
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  contactType === 'call' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                {contactType === 'call' ? (
                  <Phone color="#16A34A" size={28} strokeWidth={2.5} />
                ) : (
                  <MessageCircle color="#4B5563" size={30} />
                )}
              </View>

              <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                {contactType === 'call'
                  ? 'Ligar para o Cliente'
                  : 'Enviar Mensagem'}
              </Text>

              <Text className="text-gray-500 text-center mb-8">
                Deseja {contactType === 'call' ? 'ligar' : 'enviar mensagem'}{' '}
                para{' '}
                <Text className="font-bold text-gray-700">
                  {rideDetails.user?.phone}
                </Text>
                ?
              </Text>

              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  className="flex-1 py-4 bg-gray-100 rounded-xl items-center active:bg-gray-200"
                  onPress={() => setContactModalVisible(false)}
                >
                  <Text className="text-gray-600 font-bold text-base">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-4 rounded-xl items-center ${
                    contactType === 'call'
                      ? 'bg-green-600 active:bg-green-700'
                      : 'bg-gray-800 active:bg-gray-900'
                  }`}
                  onPress={() => {
                    setContactModalVisible(false)
                    if (contactType === 'call') {
                      Linking.openURL(`tel:${rideDetails.user?.phone}`)
                    } else {
                      Linking.openURL(`sms:${rideDetails.user?.phone}`)
                    }
                  }}
                >
                  <Text className="text-white font-bold text-base">
                    {contactType === 'call' ? 'Ligar Agora' : 'Enviar Agora'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    )
  }
)
