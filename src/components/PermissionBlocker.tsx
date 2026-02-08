import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MapPin } from 'lucide-react-native'

interface PermissionBlockerProps {
  onReqPermission: () => void
  message?: string
}

const PermissionBlocker: React.FC<PermissionBlockerProps> = ({
  onReqPermission,
  message = 'Para continuar, você precisa permitir o acesso à sua localização.'
}) => {
  return (
    // 1. Container invisível que ocupa tudo e centraliza
    <View className="items-center justify-center bg-transparent p-8">
      {/* 2. O Cartão Branco visível */}
      <View className="bg-white w-full rounded-2xl items-center p-8 shadow-sm">
        <MapPin size={64} color="#EF4444" />
        <Text className="text-center text-2xl font-bold text-gray-800 mt-4">
          Permitir acesso à localização
        </Text>
        <Text className="text-base text-center text-gray-500 mt-2 mb-6">
          {message}
        </Text>
        <TouchableOpacity
          className="w-full bg-primary-200 px-6 py-4 rounded-full items-center justify-center"
          onPress={onReqPermission}
        >
          <Text className="text-base text-white font-bold">
            Permitir Localização
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PermissionBlocker
