// src/screens/Ride/components/DriverRideCard.tsx
import {
  MessageCircle,
  Phone,
  X,
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
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { RideInterface } from '@/interfaces/IRide'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { formatMoney } from '@/utils/formattedNumber'
import { getPaymentMethodLabel } from '@/utils/gettersLabels'
import { useNavigation } from '@react-navigation/native'
import ROUTES from '@/constants/routes'

// Sub-components
import { ContactModal } from '../Modals/ContactModal'
import { RouteSection } from './RouteSection'
import { DeliveryDetailsSection } from './DeliveryDetailsSection'

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
            <RouteSection
              pickupDescription={rideDetails.pickup.description || ''}
              dropoffDescription={rideDetails.dropoff.description || ''}
              distance={distance}
            />

            {/* Delivery Details Section */}
            {rideDetails.type === 'delivery' && rideDetails.details && (
              <DeliveryDetailsSection
                details={rideDetails.details}
                userName={rideDetails.user?.name}
                userPhone={rideDetails.user?.phone}
              />
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
        <ContactModal
          visible={contactModalVisible}
          onClose={() => setContactModalVisible(false)}
          contactType={contactType}
          phone={selectedPhone}
        />
      </>
    )
  }
)
