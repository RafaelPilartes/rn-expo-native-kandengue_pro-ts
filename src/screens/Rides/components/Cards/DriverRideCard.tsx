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
  ArrowDownRight,
  Info
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
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { RideInterface } from '@/interfaces/IRide'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { formatMoney } from '@/utils/formattedNumber'
import { getPaymentMethodLabel } from '@/utils/gettersLabels'
import { useNavigation } from '@react-navigation/native'
import ROUTES from '@/constants/routes'

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
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
    const { showAlert } = useAlert()

    const handleCall = (phone?: string) => {
      const targetPhone = phone || rideDetails.user?.phone
      if (targetPhone) {
        setContactType('call')
        setSelectedPhone(targetPhone)
        setContactModalVisible(true)
      } else {
        showAlert({
          title: 'Erro',
          message: 'Número de telefone não disponível',
          type: 'error'
        })
      }
    }

    const navigation = useNavigation<any>()

    const handleMessage = () => {
      if (rideDetails.user?.id && rideDetails.driver?.id) {
        setContactModalVisible(false)
        navigation.navigate(ROUTES.Rides.CHAT, {
          rideId: rideDetails.id,
          driver: {
            id: rideDetails.driver.id,
            name: rideDetails.driver.name,
            avatar: rideDetails.driver.photo
          },
          passenger: {
            id: rideDetails.user.id,
            name: rideDetails.user.name,
            avatar: rideDetails.user.photo
          }
        })
      } else {
        showAlert({
          title: 'Erro',
          message: 'Participantes não disponíveis no momento',
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
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 24
            }}
            className="bg-white"
          >
            {/* Header: Status & Ride ID */}
            <View className="flex-row justify-between items-center mb-5">
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

            {/* Contacts Logic */}
            {(() => {
              const userPhone = rideDetails.user?.phone || ''
              const userName = rideDetails.user?.name || ''

              const senderPhone = rideDetails.details?.sender?.phone || ''
              const senderName = rideDetails.details?.sender?.name || ''

              const receiverPhone = rideDetails.details?.receiver?.phone || ''
              const receiverName = rideDetails.details?.receiver?.name || ''

              const isSenderDifferent = senderPhone && senderPhone !== userPhone
              const isReceiverDifferent =
                receiverPhone && receiverPhone !== userPhone

              return (
                <View className="mb-6 space-y-3">
                  {/* Row 1: Solicitante (The App User - Always first for Chat) */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{
                          uri:
                            rideDetails.user?.photo ||
                            'https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <View className="ml-3 flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mr-2">
                            Solicitante
                          </Text>
                        </View>
                        <Text
                          className="font-bold text-gray-900 text-sm"
                          numberOfLines={1}
                        >
                          {userName}
                        </Text>
                        <Text
                          className="text-gray-500 text-xs font-medium"
                          numberOfLines={1}
                        >
                          {userPhone || 'Sem contacto'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2 ml-2">
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                        onPress={handleMessage}
                      >
                        <MessageCircle color="#4B5563" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full bg-green-100 items-center justify-center active:bg-green-200"
                        onPress={() => handleCall(userPhone)}
                      >
                        <Phone color="#16A34A" size={16} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Row 2: Recolha (Sender - Only if different) */}
                  {rideDetails.type === 'delivery' && isSenderDifferent && (
                    <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                          <ArrowUpRight size={18} color="#22C55E" />
                        </View>
                        <View className="ml-3 flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mr-2">
                              Remetente
                            </Text>
                          </View>
                          <Text
                            className="font-bold text-gray-800 text-sm"
                            numberOfLines={1}
                          >
                            {senderName || 'Remetente'}
                          </Text>
                          <Text
                            className="text-gray-500 text-xs font-medium"
                            numberOfLines={1}
                          >
                            {senderPhone}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full bg-green-100 items-center justify-center active:bg-green-200"
                        onPress={() => handleCall(senderPhone)}
                      >
                        <Phone color="#16A34A" size={16} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Row 3: Entrega (Receiver - Only if different or always for delivery) */}
                  {rideDetails.type === 'delivery' &&
                    (isReceiverDifferent || !isSenderDifferent) && (
                      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
                            <ArrowDownRight size={18} color="#EF4444" />
                          </View>
                          <View className="ml-3 flex-1">
                            <View className="flex-row items-center">
                              <Text className="text-[10px] font-bold text-red-600 uppercase tracking-tighter mr-2">
                                Destinatário
                              </Text>
                            </View>
                            <Text
                              className="font-bold text-gray-800 text-sm"
                              numberOfLines={1}
                            >
                              {receiverName || 'Destinatário'}
                            </Text>
                            <Text
                              className="text-gray-500 text-xs font-medium"
                              numberOfLines={1}
                            >
                              {receiverPhone}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          className="w-8 h-8 rounded-full bg-green-100 items-center justify-center active:bg-green-200"
                          onPress={() => handleCall(receiverPhone)}
                        >
                          <Phone color="#16A34A" size={16} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              )
            })()}

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

                {/* Driver Instructions */}
                {rideDetails.details.driver_instructions && (
                  <View className="px-4 pb-4">
                    <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-row items-start">
                      <Info size={16} color="#6b7280" className="mt-0.5" />
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-900 font-bold text-[11px] uppercase tracking-wider mb-0.5">
                          Instruções para o Motorista
                        </Text>
                        <Text className="text-gray-800 text-xs leading-relaxed">
                          {rideDetails.details.driver_instructions}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

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
          </BottomSheetScrollView>
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
                <Text className="font-bold text-gray-700">{selectedPhone}</Text>
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
                      Linking.openURL(`tel:${selectedPhone}`)
                    } else {
                      Linking.openURL(`sms:${selectedPhone}`)
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
