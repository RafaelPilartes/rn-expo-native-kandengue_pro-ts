import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  StyleSheet,
  type ImageSourcePropType,
  type ViewToken
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthStackParamList } from '@/types/navigation'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import ROUTES from '@/constants/routes'
import { ArrowRight } from 'lucide-react-native'
import { useTranslation } from '@/hooks/useTranslation'
import DriverRed from '@/assets/images/driver_red.jpg'
import DriverDelivering from '@/assets/images/driver_delivering.jpg'
import DriverBlack from '@/assets/images/driver_black.jpg'
import { useAuthStore } from '@/storage/store/useAuthStore'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const { height: SCREEN_HEIGHT } = Dimensions.get('screen')

// --- Types ---
type OnboardingItemType = {
  id: string
  image: ImageSourcePropType
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
    // Cinematic Parallax Effect for Image
    const imageAnimatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH
        ],
        [SCREEN_WIDTH * 0.2, 0, -SCREEN_WIDTH * 0.2],
        Extrapolation.CLAMP
      )

      return {
        transform: [{ translateX }]
      }
    })

    // Typography Entrance Animation
    const textAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        x.value,
        [
          (index - 0.5) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 0.5) * SCREEN_WIDTH
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
        [80, 0, 80],
        Extrapolation.CLAMP
      )

      return {
        opacity,
        transform: [{ translateY }]
      }
    })

    return (
      <View
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        className="overflow-hidden bg-black flex-1"
      >
        <Animated.Image
          source={item.image}
          style={[
            { 
              width: SCREEN_WIDTH * 1.4, 
              height: SCREEN_HEIGHT, 
              position: 'absolute',
              left: -SCREEN_WIDTH * 0.2,
              top: 0
            }, 
            imageAnimatedStyle
          ]}
          resizeMode="cover"
        />
        
        {/* Cinematic Dark Overlay */}
        <View className="absolute inset-0 bg-black/60" />
        
        {/* Text Payload */}
        <View className="absolute bottom-0 w-full px-8 pb-[145px] justify-end">
          <Animated.View style={textAnimatedStyle}>
            <Text 
              className="text-[46px] font-black text-white leading-[52px] tracking-tight mb-4"
              style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 }}
            >
              {item.title}
            </Text>
            <Text className="text-white/80 text-[18px] leading-[28px] font-medium pr-8">
              {item.description}
            </Text>
          </Animated.View>
        </View>
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
    <View className="flex-row items-center">
      {data.map((_, index) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const width = interpolate(
            x.value,
            [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ],
            [8, 36, 8],
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
            className="h-2 mx-1.5 rounded-full bg-white shadow-sm"
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

  const x = useSharedValue(0)
  const flatListIndex = useSharedValue(0)

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x
    }
  })

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems[0]?.index !== null &&
        viewableItems[0]?.index !== undefined
      ) {
        flatListIndex.value = viewableItems[0].index
      }
    },
    [flatListIndex]
  )

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 50 }),
    []
  )

  const onboardingData = useMemo(
    () => [
      {
        id: '1',
        image: DriverRed,
        title: t('onboarding:onboarding_title_1'),
        description: t('onboarding:onboarding_description_1')
      },
      {
        id: '2',
        image: DriverDelivering,
        title: t('onboarding:onboarding_title_2'),
        description: t('onboarding:onboarding_description_2')
      },
      {
        id: '3',
        image: DriverBlack,
        title: t('onboarding:onboarding_title_3'),
        description: t('onboarding:onboarding_description_3')
      }
    ],
    [t]
  )

  const handleComplete = useCallback(() => {
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }, [navigation, setFirstTime])

  const handleSkip = useCallback(() => {
    setFirstTime(false)
    navigation.navigate(ROUTES.AuthStack.PERMISSIONS)
  }, [navigation, setFirstTime])

  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingItemType; index: number }) => {
      return <OnboardingItem item={item} index={index} x={x} />
    },
    [x]
  )

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
      pointerEvents: x.value >= secondToLastSlideOffset + 10 ? 'auto' : 'none',
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
    return { opacity }
  })

  return (
    <View className="flex-1 bg-black">
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

      {/* Safety Layer Overlay to hold Controls without blocking Swipes */}
      <SafeAreaView 
        className="absolute inset-0 justify-between" 
        edges={['top', 'bottom']}
        pointerEvents="box-none"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 w-full" pointerEvents="box-none">
          <Image
            source={require('@/assets/logo/png/logo-kandengue-white.png')}
            style={{ width: 140, height: 40, resizeMode: 'contain' }}
          />

          <Animated.View style={skipButtonAnimatedStyle}>
            <TouchableOpacity onPress={handleSkip} className="py-2.5 px-5 bg-black/30 rounded-full border border-white/20 backdrop-blur-md">
              <Text className="text-white font-medium text-sm">
                {t('common:buttons.skip') || 'Saltar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View 
          className="w-full px-8 pb-6 flex-row justify-between items-center" 
          pointerEvents="box-none"
        >
          <Pagination data={onboardingData} x={x} />

          <View className="flex-1 items-end justify-center h-16 pointer-events-auto">
            <Animated.View
              style={[swipeHintAnimatedStyle, { position: 'absolute' }]}
            >
              <View className="flex-row items-center justify-center opacity-80 py-2">
                <Text className="text-white text-[15px] font-bold mr-2 tracking-wide">
                  {t('onboarding:swipe_hint') || 'Deslize'}
                </Text>
                <ArrowRight size={22} color="#FFFFFF" strokeWidth={3} />
              </View>
            </Animated.View>

            <Animated.View
              style={[buttonAnimatedStyle, { position: 'absolute' }]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleComplete}
                className="py-4 px-8 rounded-full bg-white shadow-2xl shadow-white/40"
              >
                <Text className="text-black font-extrabold text-[16px] tracking-widest uppercase">
                  {t('common:buttons.get_started') || 'Começar'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}
