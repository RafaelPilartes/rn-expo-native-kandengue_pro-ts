import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native'
import { X, CheckCircle, ArrowLeft } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PRIMARY_COLOR = '#b31a24' // Matching PhotoStep

interface OTPStepProps {
  onClose: () => void
  onBack: () => void
  otpCode: string
  setOtpCode: (code: string) => void
  onConfirm: () => void
  photoUri: string | null
  isLoading: boolean
}

export const OTPStep: React.FC<OTPStepProps> = ({
  onClose,
  onBack,
  otpCode,
  setOtpCode,
  onConfirm,
  photoUri,
  isLoading
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-6 border-b border-gray-100">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={onBack}
            className="bg-gray-50 p-3 rounded-full"
            disabled={isLoading}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Validar</Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Passo 2 de 2: Código OTP
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onClose}
          disabled={isLoading}
          className="bg-gray-50 p-3 rounded-full"
        >
          <X size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 p-6">
        <View className="items-center mb-8 mt-4">
          {photoUri && (
            <View className="flex-row items-center bg-gray-50 p-2 pr-5 rounded-2xl mb-8 border border-gray-100">
              <Image
                source={{ uri: photoUri }}
                className="w-12 h-12 rounded-xl mr-3 bg-gray-200"
                resizeMode="cover"
              />
              <View className="mr-3">
                <Text className="text-gray-900 font-bold text-sm">
                  Foto capturada
                </Text>
                <TouchableOpacity onPress={onBack} className="mt-0.5">
                  <Text className="text-primary-200 text-xs font-bold">
                    Trocar foto
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="ml-3 bg-green-100 p-1.5 rounded-full">
                <CheckCircle size={14} color="#16A34A" />
              </View>
            </View>
          )}

          <Text className="text-center text-gray-900 font-bold text-2xl mb-3">
            Código de Entrega
          </Text>
          <Text className="text-center text-gray-500 px-4 text-base leading-6">
            Solicite ao cliente o código de 4 dígitos para finalizar a corrida.
          </Text>
        </View>

        <View className="mb-8 px-4">
          <TextInput
            className="text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl py-2 text-center text-2xl font-bold"
            placeholder="0000"
            placeholderTextColor="#E5E7EB"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={4}
            editable={!isLoading}
          />
        </View>

        <View className="flex-1 justify-end mb-4">
          <TouchableOpacity
            className={`w-full bg-white py-4 rounded-2xl gap-2 flex-row items-center justify-center border border-gray-200`}
            style={{
              ...(otpCode.length === 4
                ? {
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR
                  }
                : {})
            }}
            onPress={onConfirm}
            disabled={isLoading || otpCode.length !== 4}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CheckCircle
                  size={20}
                  color={otpCode.length === 4 ? 'white' : '#9CA3AF'}
                  className="mr-2"
                />
                <Text
                  className={`font-bold text-lg ${
                    otpCode.length === 4 ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  Finalizar Entrega
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
