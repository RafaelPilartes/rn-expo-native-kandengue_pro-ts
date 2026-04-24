// src/screens/Driver/Profile.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'
import {
  Edit,
  Car,
  CreditCard,
  HelpCircle,
  FileText,
  Info,
  Shield,
  Book,
  AlertCircle,
  LogOut,
  Target
} from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import ROUTES from '@/constants/routes'
import { useAuthViewModel } from '@/viewModels/AuthViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { getVehicleTypeLabel } from '@/utils/gettersLabels'
import { useAlert } from '@/context/AlertContext'

export default function DriverProfile() {
  const navigation = useNavigation<any>()
  const { showAlert } = useAlert()

  const { logout } = useAuthViewModel()
  const { driver } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout.mutateAsync()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const MenuItem = ({
    icon: Icon,
    label,
    onPress,
    requiresActive = true,
    isLoading
  }: {
    icon: any
    label: string
    onPress: () => void
    requiresActive?: boolean
    isLoading?: boolean
  }) => (
    <TouchableOpacity
      onPress={() => {
        if (requiresActive && driver?.status !== 'active') {
          showAlert({
            title: 'Conta Restrita',
            message:
              'A sua conta encontra-se pendente ou inativa. Para aceder a esta secção, a sua conta tem de estar ativa.',
            type: 'warning'
          })
          return
        }
        onPress()
      }}
      disabled={isLoading}
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
    >
      <Icon size={20} color={isLoading ? '#9ca3af' : 'black'} />
      <Text className={`ml-3 text-base flex-1 ${isLoading ? 'text-gray-400' : 'text-gray-800'}`}>
        {isLoading ? 'Saindo...' : label}
      </Text>
      {isLoading && <ActivityIndicator size="small" color="#111827" />}
    </TouchableOpacity>
  )

  return (
    <ScrollView
      className="flex-1 bg-gray-50 m-safe"
      contentContainerStyle={{ padding: 15, paddingBottom: 68 }}
    >
      {/* Driver Info */}
      <View className="items-center py-6 bg-white mb-3 rounded-b-3xl">
        <Image
          source={{
            uri:
              driver?.photo ??
              'https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
          }}
          className="w-24 h-24 rounded-full mb-3"
        />
        <Text className="text-2xl font-semibold text-black">
          {driver?.name}
        </Text>
        <Text className="text-gray-500 text-sm">
          Estafeta •{' '}
          {driver?.vehicle?.plate
            ? `${getVehicleTypeLabel(driver.vehicle.type)} ${driver.vehicle.brand} - ${driver.vehicle.plate}`
            : 'Nenhum veículo definido'}
        </Text>
      </View>

      {/* Account Settings */}
      <View className="bg-white mb-4 px-6 rounded-2xl">
        <MenuItem
          icon={Edit}
          label="Editar Perfil"
          requiresActive={false}
          onPress={() => navigation.navigate(ROUTES.ProfileStack.EDIT)}
        />
        <MenuItem
          icon={Car}
          label="Meus Veículos"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.VEHICLES)}
        />
        <MenuItem
          icon={FileText}
          requiresActive={false}
          label="Meus Documentos"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.DOCUMENTS)}
        />
        <MenuItem
          icon={CreditCard}
          label="Minha Carteira"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.WALLET)}
        />
        <MenuItem
          icon={Target}
          label="Missões"
          onPress={() =>
            navigation.navigate(ROUTES.MainTab.HOME, {
              screen: ROUTES.HomeStack.MISSIONS
            })
          }
        />
      </View>

      {/* Support & Info */}
      <View className="bg-white mb-4 px-6 rounded-2xl">
        <MenuItem
          icon={Info}
          label="Sobre"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.ABOUT)}
        />
        <MenuItem
          icon={HelpCircle}
          label="Ajuda"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.HELP)}
        />
        <MenuItem
          icon={AlertCircle}
          label="Reclamações"
          onPress={() => navigation.navigate(ROUTES.ProfileStack.COMPLAINTS)}
        />
      </View>

      {/* Legal */}
      <View className="bg-white mb-4 px-6 rounded-2xl">
        <MenuItem
          icon={Shield}
          label="Política de Privacidade"
          requiresActive={false}
          onPress={() => navigation.navigate(ROUTES.ProfileStack.PRIVATE)}
        />
        <MenuItem
          icon={Book}
          label="Termos e Condições"
          requiresActive={false}
          onPress={() => navigation.navigate(ROUTES.ProfileStack.TERMS)}
        />
      </View>

      {/* Logout */}
      <View className="bg-white mb-4 px-6 rounded-b-3xl">
        <MenuItem
          icon={LogOut}
          label="Sair"
          requiresActive={false}
          onPress={handleLogout}
          isLoading={isLoggingOut}
        />
      </View>
    </ScrollView>
  )
}
