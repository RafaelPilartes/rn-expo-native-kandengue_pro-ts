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
    <View className="flex-1 items-center justify-center px-5 py-10">
      <MapPin size={64} color="#EF4444" />
      <Text className="text-center text-lg font-bold text-gray-800 mt-4">
        Permissão de localização necessária
      </Text>
      <Text className="text-center text-gray-500 mt-2 mb-6">{message}</Text>
      <TouchableOpacity
        className="bg-primary-200 px-6 py-3 rounded-full"
        onPress={onReqPermission}
      >
        <Text className="text-white font-bold">Permitir Localização</Text>
      </TouchableOpacity>
    </View>
  )
}

export default PermissionBlocker
