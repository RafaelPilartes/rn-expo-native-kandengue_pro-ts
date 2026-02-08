import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { AlertCircle, BanknoteX, Car } from 'lucide-react-native'
import { AccountIssueType } from '@/hooks/useHomeViewModel'

interface AccountBlockerProps {
  issueType: AccountIssueType
  onToDocuments: () => void
  onToWallet: () => void
  onToVehicle?: () => void
}

const AccountBlocker: React.FC<AccountBlockerProps> = ({
  issueType,
  onToDocuments,
  onToWallet,
  onToVehicle
}) => {
  const content = {
    INACTIVE: {
      icon: AlertCircle,
      color: '#EF4444', // red-500
      title: 'Conta Inativa',
      message:
        'Sua conta está inativa. Por favor, envie seus documentos para verificação.',
      action: 'Verificar Documentos',
      onPress: onToDocuments
    },
    PENDING: {
      icon: AlertCircle,
      color: '#EAB308', // yellow-500
      title: 'Verificação Pendente',
      message:
        'Sua conta ainda está pendente de verificação. Por favor, aguarde.',
      action: null,
      onPress: null
    },
    NO_WALLET: {
      icon: BanknoteX,
      color: '#EAB308',
      title: 'Sem Carteira',
      message:
        'Ainda nenhuma carteira cadastrada. Por favor, aguarde ou entre em contato com o suporte.',
      action: null,
      onPress: null
    },
    NO_VEHICLE: {
      icon: Car,
      color: '#EF4444',
      title: 'Sem Veículo',
      message:
        'Precisa ter um veículo cadastrado e válido para aceitar corridas.',
      action: 'Cadastrar Veículo',
      onPress: onToVehicle || onToDocuments // Fallback if no specific vehicle nav
    },
    LOW_BALANCE: {
      icon: BanknoteX,
      color: '#EAB308',
      title: 'Saldo Insuficiente',
      message:
        'Saldo insuficiente para aceitar corridas. Carregue sua carteira.',
      action: 'Carregar Carteira',
      onPress: onToWallet
    }
  }

  const current = issueType ? content[issueType] : null

  if (!current) return null

  const Icon = current.icon

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View
        style={{
          backgroundColor: current.color + '20', // 20% opacity
          padding: 24,
          borderRadius: 999,
          marginBottom: 24
        }}
      >
        <Icon size={48} color={current.color} />
      </View>

      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {current.title}
      </Text>

      <Text className="text-base text-gray-500 text-center mb-8 px-4 leading-6">
        {current.message}
      </Text>

      {current.action && current.onPress && (
        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
          onPress={current.onPress}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            {current.action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default AccountBlocker
