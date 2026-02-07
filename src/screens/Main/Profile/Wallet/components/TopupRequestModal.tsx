// src/screens/Main/Profile/Wallet/components/TopupRequestModal.tsx
import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import { X } from 'lucide-react-native'
import { ImagePickerButton } from '@/components/wallet/ImagePickerButton'

const PRIMARY_COLOR = '#b31a24'

type TopupRequestModalProps = {
  visible: boolean
  onClose: () => void
  amount: string
  onAmountChange: (value: string) => void
  selectedImage: string | null
  onPickImage: () => void
  onClearImage: () => void
  onSubmit: () => void
  isSubmitting: boolean
  isSelectingImage: boolean
}

export function TopupRequestModal({
  visible,
  onClose,
  amount,
  onAmountChange,
  selectedImage,
  onPickImage,
  onClearImage,
  onSubmit,
  isSubmitting,
  isSelectingImage
}: TopupRequestModalProps) {
  const canSubmit = amount.trim() && selectedImage && !isSubmitting

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/60 justify-end py-safe">
            <View className="bg-white rounded-t-[32px] h-[90%] overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    Carregar Saldo
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Envie o comprovativo de transferência
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isSubmitting}
                  className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                >
                  <X size={22} color={isSubmitting ? '#9CA3AF' : '#374151'} />
                </TouchableOpacity>
              </View>

              <View className="flex-1 px-6 py-6">
                {/* Valor */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Valor a carregar (Kz)
                    <Text className="text-red-600"> *</Text>
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={onAmountChange}
                    placeholder="Ex: 5000"
                    keyboardType="numeric"
                    editable={!isSubmitting}
                    className="text-black border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-semibold focus:border-primary-400"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text className="text-xs text-gray-500 mt-2">
                    Valor mínimo: 500 AOA
                  </Text>
                </View>

                {/* Comprovativo */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Comprovativo de Transferência
                    <Text className="text-red-600"> *</Text>
                  </Text>
                  <ImagePickerButton
                    imageUri={selectedImage}
                    onPickImage={onPickImage}
                    onClearImage={onClearImage}
                    isLoading={isSelectingImage}
                    label="Carregar comprovativo"
                  />
                </View>

                {/* Info Box */}
                <View className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
                  <Text className="text-xs text-amber-900 leading-relaxed">
                    💡 <Text className="font-semibold">Importante:</Text> O
                    valor deve corresponder ao comprovativo. O saldo será
                    creditado após aprovação.
                  </Text>
                </View>
              </View>

              {/* Fixed Bottom Button */}
              <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={!canSubmit}
                  className={`py-4 rounded-2xl ${
                    !canSubmit ? 'bg-gray-300' : 'bg-primary-400'
                  }`}
                  style={
                    canSubmit
                      ? {
                          shadowColor: PRIMARY_COLOR,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4
                        }
                      : undefined
                  }
                >
                  <Text className="text-white text-center font-bold text-base">
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                  </Text>
                </TouchableOpacity>
                {!canSubmit && (
                  <Text className="text-center text-gray-400 text-xs mt-3">
                    Preencha todos os campos obrigatórios (*)
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}
