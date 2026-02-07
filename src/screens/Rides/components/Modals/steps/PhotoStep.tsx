import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native'
import { Camera, X, CheckCircle, Image as ImageIcon } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const PRIMARY_COLOR = '#b31a24' // primary-400

interface PhotoStepProps {
  onClose: () => void
  onTakePhoto: () => void
  photoUri: string | null
  onRemovePhoto: () => void
  onContinue: () => void
  isLoading: boolean
  isPickingImage: boolean
}

export const PhotoStep: React.FC<PhotoStepProps> = ({
  onClose,
  onTakePhoto,
  photoUri,
  onRemovePhoto,
  onContinue,
  isLoading,
  isPickingImage
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 mb-6 border-b border-gray-100">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Comprovativo</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Passo 1 de 2: Foto da Encomenda
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          disabled={isLoading}
          className="bg-gray-50 p-4 rounded-full"
        >
          <X size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 pt-6 items-center">
        {photoUri ? (
          <View className="w-full items-center">
            {/* Image Container */}
            <View
              className="bg-white rounded-3xl p-2 mb-8"
              style={{
                shadowColor: '#2424244b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 8
              }}
            >
              <Image
                source={{ uri: photoUri }}
                style={{ width: width * 0.75, height: width * 0.75 }}
                className="rounded-2xl bg-gray-100"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={onRemovePhoto}
                className="absolute -top-4 -right-4 bg-red-600 p-2 rounded-full border-2 border-white"
                style={{
                  shadowColor: '#dc2626bb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>

            <View className="w-full gap-4 px-6">
              <TouchableOpacity
                className="w-full bg-primary-200 py-4 rounded-2xl gap-2 flex-row items-center justify-center"
                onPress={onContinue}
              >
                <CheckCircle size={16} color="white" className="mr-2" />
                <Text className="text-white font-bold text-base">
                  Confirmar Foto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-white py-4 rounded-2xl gap-2 flex-row items-center justify-center border border-gray-200"
                onPress={onTakePhoto}
              >
                <Camera size={16} color="#4B5563" className="mr-2" />
                <Text className="text-gray-700 font-bold text-base">
                  Tirar Outra
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="w-full items-center">
            {/* Instructions */}
            <View className="items-center mb-8 bg-gray-50 p-6 rounded-3xl w-full">
              <Text className="text-center text-gray-900 font-bold text-xl mb-2">
                Foto Obrigatória
              </Text>

              <Text className="text-center text-gray-500 text-sm leading-5">
                Para segurança, tire uma foto legível da encomenda antes de
                prosseguir.
              </Text>
            </View>

            {/* Capture Button Area - Redesigned */}
            <TouchableOpacity
              className="w-full aspect-square bg-white border-2 border-dashed border-gray-200 rounded-[32px] items-center justify-center active:bg-gray-50"
              style={{ maxHeight: width * 0.8 }}
              onPress={onTakePhoto}
              disabled={isPickingImage}
            >
              {isPickingImage ? (
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              ) : (
                <>
                  <View className="bg-gray-50 p-6 rounded-full mb-4">
                    <ImageIcon size={40} color={PRIMARY_COLOR} />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Tocar para Capturar
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Abrir câmera
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
