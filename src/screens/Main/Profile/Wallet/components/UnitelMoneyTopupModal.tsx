// src/screens/Main/Profile/Wallet/components/UnitelMoneyTopupModal.tsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native'
import { X, Smartphone } from 'lucide-react-native'
import {
  requestWalletTopup,
  type WalletTopupApiResponse
} from '@/modules/Api/rest/walletTopup.api'

const PRIMARY_COLOR = '#b31a24'

type UnitelMoneyTopupModalProps = {
  visible: boolean
  onClose: () => void
  walletId: string
  driverPhone: string
  onSuccess: (response: WalletTopupApiResponse) => void
}

export function UnitelMoneyTopupModal({
  visible,
  onClose,
  walletId,
  driverPhone,
  onSuccess
}: UnitelMoneyTopupModalProps) {
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pré-preencher telefone ao abrir
  useEffect(() => {
    if (visible) {
      setPhoneNumber(driverPhone || '')
      setAmount('')
    }
  }, [visible, driverPhone])

  const validateForm = (): boolean => {
    if (!amount.trim()) {
      Alert.alert('Erro', 'Por favor, insira o valor do carregamento')
      return false
    }

    const amountValue = Number(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido')
      return false
    }

    if (amountValue < 500) {
      Alert.alert('Erro', 'O valor mínimo de carregamento é 500 AOA')
      return false
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Erro', 'Por favor, insira o número de telefone')
      return false
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '')
    if (cleanPhone.length < 9) {
      Alert.alert('Erro', 'Número de telefone inválido')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '')

      const response = await requestWalletTopup({
        walletId,
        phoneNumber: cleanPhone,
        amount: Number(amount)
      })

      // Limpar e fechar
      setAmount('')
      setPhoneNumber('')

      Alert.alert(
        'Pagamento em Processamento',
        'O pedido foi enviado para o Unitel Money. Irá receber uma notificação no seu telemóvel para confirmar o pagamento.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess(response)
              onClose()
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Erro ao solicitar topup Unitel Money:', error)
      Alert.alert(
        'Erro no Pagamento',
        error.message ||
          'Não foi possível processar o pagamento. Tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = amount.trim() && phoneNumber.trim() && !isSubmitting

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[36px] h-[85%] overflow-hidden">
              {/* Drag Indicator */}
              <View className="items-center pt-3 pb-1">
                <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-4">
                <View className="flex-row items-center">
                  <View className="mr-4 shadow-sm" style={{ width: 64, height: 64 }}>
                    <Image
                      source={require('@/assets/images/payment/unitel_money.png')}
                      style={{ width: '100%', height: '100%', borderRadius: 16 }}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      Unitel Money
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5 font-medium">
                      Pagamento Rápido e Seguro
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X
                    size={20}
                    color={isSubmitting ? '#9CA3AF' : '#4B5563'}
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-1 px-6 pt-4 pb-24">
                {/* Valor Input */}
                <View className="mb-6">
                  <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                    Qual o valor a carregar?{' '}
                    <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-3xl px-5 py-2 flex-row items-center">
                    <Text className="text-gray-800 text-base font-normal mr-2">
                      AOA
                    </Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="5000"
                      keyboardType="numeric"
                      editable={!isSubmitting}
                      className="flex-1 text-black text-base py-2 font-normal"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-2 ml-2 font-medium">
                    Valor mínimo: 500 AOA
                  </Text>
                </View>

                {/* Número Unitel Money Input */}
                <View className="mb-8">
                  <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                    Número Unitel Money <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-3xl px-5 py-2 flex-row items-center">
                    <Smartphone size={20} color="#6B7280" className="mr-3" />
                    <TextInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="923 456 789"
                      keyboardType="phone-pad"
                      editable={!isSubmitting}
                      maxLength={15}
                      className="flex-1 text-black text-base py-2 font-normal tracking-wider"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Premium Info Box */}
                <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                  <View className="flex-row items-start">
                    <View className="bg-white w-8 h-8 rounded-full items-center justify-center mr-3 shadow-sm border border-gray-50">
                      <Text className="text-base text-gray-500 font-bold">
                        💡
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-700 leading-relaxed font-medium">
                      Ao Confirmar, irá receber uma notificação no seu
                      dispositivo para autorizar e debitar do Unitel Money.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fixed Bottom Action */}
              <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4"
                style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 24 }}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                  className="py-4 rounded-full flex-row items-center justify-center"
                  style={{
                    backgroundColor: !canSubmit ? '#E5E7EB' : PRIMARY_COLOR
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" className="mr-3" />
                  ) : null}
                  <Text
                    className={`text-center font-extrabold text-lg ${
                      !canSubmit ? 'text-gray-400' : 'text-white'
                    }`}
                  >
                    {isSubmitting ? 'A Processar...' : 'Pagar Agora'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}
