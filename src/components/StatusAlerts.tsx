// src/components/StatusAlerts.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { DriverInterface } from '@/interfaces/IDriver'
import { WalletInterface } from '@/interfaces/IWallet'
import { MIN_AMOUNT } from '@/constants/config'
import { VehicleInterface } from '@/interfaces/IVehicle'

interface StatusAlertsProps {
  driver: DriverInterface | null
  vehicle: VehicleInterface | null
  wallet: WalletInterface | null
  onToDocuments: () => void
  onToWallet: () => void
}

const StatusAlerts: React.FC<StatusAlertsProps> = ({
  driver,
  vehicle,
  wallet,
  onToDocuments,
  onToWallet
}) => {
  if (driver?.status === 'inactive') {
    return (
      <View className="bg-red-100 border border-red-300 mx-5 p-4 rounded-2xl mb-4">
        <Text className="text-red-800">
          Sua conta está inativa. Por favor, envie seus documentos para
          verificação.
        </Text>
        <Text className="text-red-800 font-semibold italic">
          Perfil {'>'} Meus documentos
        </Text>
        {/* <TouchableOpacity
          onPress={onToDocuments}
          className="mt-3 bg-red-300 px-4 py-2 rounded-full items-center"
        >
          <Text className="text-red-900 font-semibold">Enviar agora</Text>
        </TouchableOpacity> */}
      </View>
    )
  }

  if (driver?.status === 'pending') {
    return (
      <View className="bg-yellow-100 border border-yellow-300 mx-5 p-4 rounded-2xl mb-4">
        <Text className="text-yellow-800">
          Sua conta ainda está pendente de verificação. Por favor, aguarde.
        </Text>
      </View>
    )
  }

  if (!wallet && driver?.status === 'active') {
    return (
      <View className="bg-yellow-100 border border-yellow-300 mx-5 p-4 rounded-2xl mb-4">
        <Text className="text-yellow-800">
          Ainda nenhuma carteira cadastrada. Por favor, aguarde ou entre em
          contato com o suporte.
        </Text>
      </View>
    )
  }

  if (!driver?.vehicle && !vehicle && driver?.status === 'active') {
    return (
      <View className="bg-yellow-100 border border-yellow-300 mx-5 p-4 rounded-2xl mb-4">
        <Text className="text-yellow-800">
          Ainda nenhuma veículo cadastrado ou aprovado.
        </Text>
        <Text className="text-yellow-800 font-semibold italic">
          Perfil {'>'} Meus veículos {'>'} Novo veículo
        </Text>
      </View>
    )
  }

  if (wallet && wallet.balance < MIN_AMOUNT && driver?.status === 'active') {
    return (
      <View className="bg-yellow-100 border border-yellow-300 mx-5 p-4 rounded-2xl mb-4">
        <Text className="text-yellow-800">
          Saldo insuficiente para aceitar corridas. Carregue sua carteira.
        </Text>
        <Text className="text-yellow-800 font-semibold italic">
          Perfil {'>'} Minha carteira {'>'} Carregar Saldo
        </Text>
        {/* <TouchableOpacity
          onPress={onToWallet}
          className="mt-3 bg-yellow-300 px-4 py-2 rounded-full items-center"
        >
          <Text className="text-yellow-900 font-semibold">Carregar agora</Text>
        </TouchableOpacity> */}
      </View>
    )
  }

  return null
}

export default StatusAlerts
