// src/screens/Ride/components/RideStatusArrivedDestination.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {
  Package,
  CheckCircle,
  User,
  ChevronDown,
  ChevronUp,
  Camera
} from 'lucide-react-native'

interface PackageInfo {
  type?: string
  description?: string
  size?: string
}

interface RideStatusArrivedDestinationProps {
  onConfirm: () => void
  customerName?: string
  packageInfo?: PackageInfo
}

export const RideStatusArrivedDestination: React.FC<
  RideStatusArrivedDestinationProps
> = ({ onConfirm, customerName, packageInfo }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections)
    if (newSections.has(section)) {
      newSections.delete(section)
    } else {
      newSections.add(section)
    }
    setExpandedSections(newSections)
  }

  const isSectionExpanded = (section: string) => expandedSections.has(section)

  return (
    <>
      <View className="absolute top-safe left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              Entrega Final
            </Text>
            <Text className="text-gray-500 text-sm">Pronto para finalizar</Text>
          </View>
        </View>

        {/* Informações Essenciais */}
        <View className="space-y-2 mb-3">
          {customerName && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <User size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">Destinatário</Text>
              </View>
              <Text className="text-gray-900 font-semibold">
                {customerName}
              </Text>
            </View>
          )}

          {packageInfo?.description && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Package size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">Pacote</Text>
              </View>
              <Text
                className="text-gray-900 font-semibold text-sm"
                numberOfLines={1}
              >
                {packageInfo.description}
              </Text>
            </View>
          )}
        </View>

        {/* Seção de Checklist - Colapsável */}
        {/* <TouchableOpacity
          className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg mb-2"
          onPress={() => toggleSection('checklist')}
        >
          <View className="flex-row items-center">
            <CheckCircle size={16} color="#1D4ED8" />
            <Text className="text-blue-800 font-medium ml-2">
              Checklist de Entrega
            </Text>
          </View>
          {isSectionExpanded('checklist') ? (
            <ChevronUp size={16} color="#1D4ED8" />
          ) : (
            <ChevronDown size={16} color="#1D4ED8" />
          )}
        </TouchableOpacity>

        {isSectionExpanded('checklist') && (
          <View className="bg-blue-50 p-3 rounded-lg mb-3">
            <View className="space-y-2">
              <Text className="text-blue-800 text-sm">
                ✅ Entregue ao destinatário correto
              </Text>
              <Text className="text-blue-800 text-sm">
                ✅ Confirmada a identidade
              </Text>
              <Text className="text-blue-800 text-sm">
                ✅ Pacote em boas condições
              </Text>
              <Text className="text-blue-800 text-sm">
                ✅ Código OTP solicitado
              </Text>
              <Text className="text-blue-800 text-sm">
                ✅ Foto tirada como comprovativo
              </Text>
            </View>
          </View>
        )} */}

        {/* Seção de Instruções - Colapsável */}
        {/* <TouchableOpacity
          className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg mb-3"
          onPress={() => toggleSection('instructions')}
        >
          <View className="flex-row items-center">
            <Camera size={16} color="#059669" />
            <Text className="text-green-800 font-medium ml-2">
              Novo: Foto Obrigatória
            </Text>
          </View>
          {isSectionExpanded('instructions') ? (
            <ChevronUp size={16} color="#059669" />
          ) : (
            <ChevronDown size={16} color="#059669" />
          )}
        </TouchableOpacity>

        {isSectionExpanded('instructions') && (
          <View className="bg-green-50 p-3 rounded-lg mb-3">
            <Text className="text-green-800 text-sm font-semibold mb-1">
              Agora com foto obrigatória:
            </Text>
            <View className="space-y-1">
              <Text className="text-green-700 text-sm">
                1. Tire foto da encomenda entregue
              </Text>
              <Text className="text-green-700 text-sm">
                2. Peça o código OTP ao cliente
              </Text>
              <Text className="text-green-700 text-sm">
                3. Digite o código de 4 dígitos
              </Text>
              <Text className="text-green-700 text-sm">
                4. Finalize a entrega
              </Text>
            </View>
          </View>
        )} */}

        {/* Botão de Iniciar Confirmação */}
        <TouchableOpacity
          className="bg-green-500 py-3 rounded-xl flex-row items-center justify-center gap-2"
          onPress={onConfirm}
        >
          <Camera size={18} color="white" className="mr-2" />
          <Text className="text-white font-semibold text-base">
            Iniciar Confirmação
          </Text>
        </TouchableOpacity>

        {/* Informação sobre o processo de entrega */}
        <View className="mt-2 bg-yellow-50 p-2 rounded-lg">
          <Text className="text-yellow-800 text-xs text-center">
            Para finalizar, tire uma foto como comprovativo de entrega.
          </Text>
        </View>
      </View>
    </>
  )
}
