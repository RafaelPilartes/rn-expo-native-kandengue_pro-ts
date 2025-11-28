import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import PrimaryButton from '@/components/ui/button/PrimaryButton'
import LineGradient from '@/components/LineGradient'
import { AuthStackParamList } from '@/types/navigation'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import ROUTES from '@/constants/routes'
import { SuccessCircule } from '@/constants/icons'
import { useTranslation } from 'react-i18next'

const CODE_LENGTH = 6

export default function ForgotPasswordSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { t } = useTranslation(['auth', 'common'])

  const navigateTo = (to: any) => {
    navigation.navigate(to)
  }

  const [code, setCode] = useState('')

  const handleChange = (value: string) => {
    // Apenas números e até o tamanho máximo
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH)
    setCode(cleanValue)
  }

  const handleDone = () => {
    navigateTo(ROUTES.AuthStack.SIGN_IN)
  }
  return (
    <View className="flex-1 flex items-center justify-center p-container m-safe">
      <View className="items-center mt-16">
        <View className="mb-6">
          <SuccessCircule width={120} height={120} />
        </View>

        <Text className="text-3xl font-bold text-black mb-2">
          {t('auth:success')}
        </Text>
        <Text className="text-lg text-gray-500 text-center px-8">
          {t('auth:success_code_message')}
        </Text>
      </View>

      <PrimaryButton
        className="w-72 mt-12 mb-12"
        label={t('common:buttons.continue')}
        onPress={handleDone}
      />

      {/* line linear gradient */}
      <LineGradient />
    </View>
  )
}
