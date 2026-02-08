import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ViewToken
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthStackParamList } from '@/types/navigation'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import ROUTES from '@/constants/routes'
import { ArrowRight } from 'lucide-react-native'
import LineGradient from '@/components/LineGradient'
import { useTranslation } from '@/hooks/useTranslation'
import {
  OnboardingOne,
  OnboardingThree,
  OnboardingTwo
} from '@/constants/images'
import { useAuthStore } from '@/storage/store/useAuthStore'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  FadeIn,
  type SharedValue
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// --- Types ---
type OnboardingItemType = {
  id: string
  image: React.ReactNode
  title: string
  description: string
}

// --- Components ---

const OnboardingItem = React.memo(
  ({
    item,
    index,
    x
  }: {
    item: OnboardingItemType
    index: number
    x: SharedValue<number>
  }) => {
    // Parallax Effect for Image
    const imageAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH
        ],
        [0, 1, 0],
        Extrapolation.CLAMP
      )

      const translateY = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH
        ],
        [100, 0, 100],
        Extrapolation.CLAMP
      )

      const scale = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH
        ],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP
      )

      return {
        opacity,
        transform: [{ translateY }, { scale }]
      }
    })

    // Text Entrance Animation
    const textAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        x.value,
        [
          (index - 0.7) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 0.7) * SCREEN_WIDTH
        ],
        [0, 1, 0],
        Extrapolation.CLAMP
      )

      const translateY = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH
        ],
        [50, 0, 50],
        Extrapolation.CLAMP
      )

      return {
        opacity,
        transform: [{ translateY }]
      }
    })

    return (
      <View
        style={{ width: SCREEN_WIDTH }}
        className="items-center justify-center p-container"
      >
        <Animated.View
          style={[imageAnimatedStyle]}
          className="items-center mb-8"
        >
          {item.image}
        </Animated.View>
        <Animated.View style={[textAnimatedStyle]}>
          <Text className="text-4xl font-bold text-center mb-4 text-gray-900">
            {item.title}
          </Text>
          <Text className="text-center text-gray-500 text-base leading-6 px-4">
            {item.description}
          </Text>
        </Animated.View>
      </View>
    )
  }
)

const Pagination = ({
  data,
  x
}: {
  data: OnboardingItemType[]
  x: SharedValue<number>
}) => {
  return (
    <View className="flex-row justify-center items-center mb-6">
      {data.map((_, index) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const width = interpolate(
            x.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ],
            [8, 32, 8],
            Extrapolation.CLAMP
          )

          const opacity = interpolate(
            x.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ],
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
          )

          return {
            width,
            opacity
          }
        })

        return (
          <Animated.View
            key={index}
            style={[animatedDotStyle]}
            className="h-2 rounded-full mx-1 bg-primary-200"
          />
        )
      })}
    </View>
  )
}

// --- Main Screen ---

export default function Onboarding() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { setFirstTime } = useAuthStore()
  const { t } = useTranslation(['onboarding', 'common'])

  // Shared Value for Scroll
  const x = useSharedValue(0)
  const flatListIndex = useSharedValue(0)

  // Scroll Handler
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x
    }
  })

  // Update index value
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems[0]?.index !== null &&
        viewableItems[0]?.index !== undefined
      ) {
        flatListIndex.value = viewableItems[0].index
      }
    },
    []
  )

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 50 }),
    []
  )

  const onboardingData = useMemo(
    () => [
      {
        id: '1',
        image: <OnboardingOne width={SCREEN_WIDTH * 0.9} height={300} />,
        title: t('onboarding:onboarding_title_1'),
        description: t('onboarding:onboarding_description_1')
      },
      {
        id: '2',
        image: <OnboardingTwo width={SCREEN_WIDTH * 0.9} height={350} />,
        title: t('onboarding:onboarding_title_2'),
        description: t('onboarding:onboarding_description_2')
      },
      {
        id: '3',
        image: <OnboardingThree width={SCREEN_WIDTH * 0.9} height={350} />,
        title: t('onboarding:onboarding_title_3'),
        description: t('onboarding:onboarding_description_3')
      }
    ],
    [t]
  )

  const handleComplete = () => {
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }

  const handleSkip = () => {
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }

  // Render Item Callback
  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingItemType; index: number }) => {
      return <OnboardingItem item={item} index={index} x={x} />
    },
    []
  )

  // Animated Styles for Buttons
  const lastSlideOffset = (onboardingData.length - 1) * SCREEN_WIDTH
  const secondToLastSlideOffset = (onboardingData.length - 2) * SCREEN_WIDTH

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [secondToLastSlideOffset, lastSlideOffset],
      [0, 1],
      Extrapolation.CLAMP
    )

    const scale = interpolate(
      x.value,
      [secondToLastSlideOffset, lastSlideOffset],
      [0.8, 1],
      Extrapolation.CLAMP
    )

    return {
      opacity,
      transform: [{ scale }],
      // Use pointerEvents to disable interaction when not visible, preventing accidental clicks
      pointerEvents: x.value >= secondToLastSlideOffset + 10 ? 'auto' : 'none',
      zIndex: x.value >= secondToLastSlideOffset + 10 ? 1 : -1
    }
  })

  const skipButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [secondToLastSlideOffset, lastSlideOffset],
      [1, 0],
      Extrapolation.CLAMP
    )

    return {
      opacity,
      zIndex: x.value < lastSlideOffset - 10 ? 1 : -1,
      pointerEvents: x.value < lastSlideOffset - 10 ? 'auto' : 'none'
    }
  })

  const swipeHintAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [secondToLastSlideOffset, lastSlideOffset],
      [1, 0],
      Extrapolation.CLAMP
    )
    return {
      opacity
    }
  })

  return (
    <SafeAreaView className="flex-1 bg-white m-safe">
      <Animated.View entering={FadeIn.duration(1000)} className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 z-10">
          <View>
            <Image
              source={require('@/assets/logo/png/logo-kandengue-red.png')}
              style={{ width: 140, height: 60, resizeMode: 'contain' }}
            />
          </View>

          <Animated.View style={skipButtonAnimatedStyle}>
            <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
              <Text className="text-gray-500 font-medium text-base">
                {t('common:buttons.skip')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Content */}
        <Animated.FlatList
          data={onboardingData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Footer */}
        <View className="px-6 pb-12 pt-4">
          <Pagination data={onboardingData} x={x} />

          <View className="h-16 justify-center items-center">
            {/* Swipe Hint */}
            <Animated.View
              style={[swipeHintAnimatedStyle, { position: 'absolute' }]}
            >
              <View className="flex-row items-center justify-center opacity-60">
                <Text className="text-gray-400 text-xs mr-2">
                  {t('onboarding:swipe_hint') || 'Deslize'}
                </Text>
                <ArrowRight size={16} color="#9CA3AF" />
              </View>
            </Animated.View>

            {/* Get Started Button */}
            <Animated.View
              style={[
                buttonAnimatedStyle,
                { width: '100%', alignItems: 'center', position: 'absolute' }
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleComplete}
                className="w-full max-w-xs py-4 rounded-full items-center justify-center bg-primary-200 shadow-xl shadow-primary-200/30"
              >
                <Text className="text-white font-bold text-lg tracking-wide">
                  {t('common:buttons.get_started') || 'Começar'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      <LineGradient />
    </SafeAreaView>
  )
}
