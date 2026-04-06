// src/screens/Main/Profile/Wallet/components/PaymentMethodModal.tsx
import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Image
} from 'react-native'
import { X, Smartphone, Building2, ChevronRight } from 'lucide-react-native'

const PRIMARY_COLOR = '#b31a24'

type PaymentMethod = 'unitel_money' | 'bank_transfer'

type PaymentMethodModalProps = {
  visible: boolean
  onClose: () => void
  onSelectMethod: (method: PaymentMethod) => void
}

const METHODS: {
  key: PaymentMethod
  image: any
  title: string
  description: string
  iconBgColor: string
}[] = [
  {
    key: 'unitel_money',
    image: require('@/assets/images/payment/unitel_money.png'),
    title: 'Unitel Money',
    description: 'Pagamento instantâneo via telemóvel',
    iconBgColor: '#FFF1F2'
  },
  {
    key: 'bank_transfer',
    image: require('@/assets/images/payment/bank.png'),
    title: 'Transferência Bancária',
    description: 'Envie o comprovativo de pagamento',
    iconBgColor: '#F3F4F6'
  }
]

export function PaymentMethodModal({
  visible,
  onClose,
  onSelectMethod
}: PaymentMethodModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              className="bg-white rounded-t-[36px] overflow-hidden"
              style={{
                paddingBottom: Platform.OS === 'ios' ? 40 : 24
              }}
            >
              {/* Drag Indicator */}
              <View className="items-center pt-3 pb-1">
                <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-4">
                <View>
                  <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Carregar Saldo
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1 font-medium">
                    Escolha como deseja adicionar fundos
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={20} color="#4B5563" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Methods */}
              <View className="px-5 py-4 gap-4">
                {METHODS.map(method => {
                  return (
                    <TouchableOpacity
                      key={method.key}
                      onPress={() => onSelectMethod(method.key)}
                      activeOpacity={0.7}
                      className="flex-row items-center p-4 bg-white rounded-3xl"
                      style={{
                        borderWidth: 1.5,
                        borderColor: '#F3F4F6'
                      }}
                    >
                      <View
                        className="mr-4 shadow-sm"
                        style={{ width: 55, height: 55 }}
                      >
                        <Image
                          source={method.image}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 16
                          }}
                          resizeMode="cover"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 mb-0.5">
                          {method.title}
                        </Text>
                        <Text className="text-sm text-gray-500 font-medium">
                          {method.description}
                        </Text>
                      </View>

                      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                        <ChevronRight
                          size={20}
                          color="#9CA3AF"
                          strokeWidth={2.5}
                        />
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
