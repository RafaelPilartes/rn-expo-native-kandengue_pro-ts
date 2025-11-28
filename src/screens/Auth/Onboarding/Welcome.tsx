import { View, Text, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PrimaryButton from '@/components/ui/button/PrimaryButton'
import ROUTES from '@/constants/routes'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '@/types/navigation'

export default function WelcomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>()

  const navigateTo = (to: keyof AuthStackParamList) => {
    navigation.navigate(to as any)
  }

  return (
    <SafeAreaView className="flex-1 justify-end bg-white p-container">
      {/* Logo */}
      <View className="mt-12 mb-4 items-start">
        <Image
          source={require('@/assets/logo/png/logo-kandengue-red.png')}
          style={{ width: 240, height: 100, resizeMode: 'contain' }}
        />
      </View>

      {/* Texto de boas-vindas */}
      <View className="items-start my-6">
        <Text className="text-4xl text-primary-200 font-extrabold mt-2">
          Bem-vindo!
        </Text>
        <Text className="text-gray-500 text-start text-lg mt-4 mb-6">
          Conecte-se para continuar explorando o Kandengue Atrevido.
        </Text>
      </View>

      {/* Botões */}
      <PrimaryButton
        className="mb-4"
        label="Entrar"
        onPress={() => navigateTo(ROUTES.AuthStack.SIGN_IN)}
      />
      <PrimaryButton
        className="mb-6"
        label="Criar conta"
        variant="outline"
        onPress={() => navigateTo(ROUTES.AuthStack.SIGN_UP)}
      />
    </SafeAreaView>
  )
}
