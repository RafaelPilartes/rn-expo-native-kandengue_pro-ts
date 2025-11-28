import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthStackParamList } from '@/types/navigation'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import ROUTES from '@/constants/routes'
import { ArrowRight, Check } from 'lucide-react-native'
import LineGradient from '@/components/LineGradient'
import { useTranslation } from '@/hooks/useTranslation'
import {
  OnboardingOne,
  OnboardingThree,
  OnboardingTwo
} from '@/constants/images'
import { useAuthStore } from '@/storage/store/useAuthStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function Onboarding() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { setFirstTime } = useAuthStore()

  const { t } = useTranslation(['onboarding', 'common'])

  const [currentStep, setCurrentStep] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onboardingData = [
    {
      id: '1',
      image: <OnboardingOne width={SCREEN_WIDTH} height={260} />,
      title: t('onboarding:onboarding_title_1'),
      description: t('onboarding:onboarding_description_1')
    },
    {
      id: '2',
      image: <OnboardingTwo width={SCREEN_WIDTH} height={350} />,
      title: t('onboarding:onboarding_title_2'),
      description: t('onboarding:onboarding_description_2')
    },
    {
      id: '3',
      image: <OnboardingThree width={SCREEN_WIDTH} height={350} />,
      title: t('onboarding:onboarding_title_3'),
      description: t('onboarding:onboarding_description_3')
    }
  ]

  // 🔹 CORREÇÃO: Navegação apenas no último passo
  const handleComplete = () => {
    console.log('Navigating to permissions...')
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }

  // 🔹 CORREÇÃO: Atualizar passo atual no scroll
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const newStep = Math.round(contentOffsetX / SCREEN_WIDTH)

    if (newStep !== currentStep) {
      setCurrentStep(newStep)
    }
  }

  // 🔹 CORREÇÃO: Scroll mais preciso
  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const newStep = Math.round(contentOffsetX / SCREEN_WIDTH)

    // 🔹 FORÇAR atualização do estado
    if (newStep !== currentStep) {
      setCurrentStep(newStep)
    }
  }

  // 🔹 CORREÇÃO: Render item com layout melhor
  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View className="w-screen items-center justify-center p-container">
      <View className="items-center mb-2">{item.image}</View>
      <Text className="text-4xl font-bold text-center mb-2">{item.title}</Text>
      <Text className="text-center text-gray-500">{item.description}</Text>
    </View>
  )

  // 🔹 CORREÇÃO: Pular onboarding
  const handleSkip = () => {
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }

  return (
    <SafeAreaView className="flex-1 bg-white m-safe">
      {/* Header com Logo e Skip */}
      <View className="flex-row justify-between items-center px-6 pt-4">
        <View className="mb-8">
          <Image
            source={require('@/assets/logo/png/logo-kandengue-red.png')}
            style={{ width: 180, height: 70, resizeMode: 'contain' }}
          />
        </View>

        {/* 🔹 MOSTRAR "Skip" apenas se NÃO estiver no último passo */}
        {currentStep < onboardingData.length - 1 && (
          <TouchableOpacity onPress={handleSkip} className="ml-4">
            <Text className="text-primary-200 font-medium text-base">
              {t('common:buttons.skip')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carrossel - Ocupa a maior parte da tela */}
      <View className="flex-1 flex-col justify-between py-8">
        <View>
          <FlatList
            ref={flatListRef}
            data={onboardingData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index
            })}
            // 🔹 GARANTIR que o scroll funcione corretamente
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="center"
          />
        </View>

        {/* Footer com Indicadores e Instrução/Botão */}
        <View className="px-6 pb-8 pt-2">
          {/* Indicadores */}
          <View className="flex-row justify-center items-center mb-4">
            {onboardingData.map((_, index) => (
              <View
                key={index}
                className={`mx-1 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary-200 w-8 h-3'
                    : 'bg-gray-300 w-3 h-3'
                }`}
              />
            ))}
          </View>

          {/* 🔹 MENSAGEM DE ARRASTAR ou BOTÃO CONCLUIR */}
          {currentStep < onboardingData.length - 1 ? (
            // 🔹 MOSTRAR instrução para arrastar
            <View className="items-center">
              {/* <Text className="text-gray-500 text-sm text-center mb-2">
              {t('onboarding:swipe_to_continue') ||
                'Arraste para o lado para continuar'}
            </Text> */}
              <View className="flex-row items-center justify-center">
                <ArrowRight size={16} color="#6B7280" className="mr-1" />
                <Text className="text-gray-400 text-xs">
                  {t('onboarding:swipe_hint') || 'Deslize'}
                </Text>
              </View>
            </View>
          ) : (
            // 🔹 MOSTRAR botão "Concluir" apenas no último passo
            <View className="items-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleComplete}
                className="w-full max-w-xs py-4 rounded-2xl items-center justify-center bg-primary-200 shadow-lg"
                accessibilityRole="button"
                accessibilityLabel={t('common:buttons.get_started')}
              >
                <Text className="text-white font-semibold text-lg">
                  {t('common:buttons.get_started') || 'Começar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Gradiente no bottom */}
      <LineGradient />
    </SafeAreaView>
  )
}
