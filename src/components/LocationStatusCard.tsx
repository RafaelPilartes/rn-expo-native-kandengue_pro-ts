// src/components/LocationStatusCard.tsx
import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet
} from 'react-native'
import { MapPin, Navigation, RefreshCw } from 'lucide-react-native'

interface LocationStatusCardProps {
  address: string | null
  isGettingAddress: boolean
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  onOpenMap: () => void
  hasLocation: boolean
}

const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  address,
  isGettingAddress,
  isLoading,
  error,
  onRefresh,
  onOpenMap,
  hasLocation
}) => {
  const isBusy = isLoading || isGettingAddress
  const pulseAnim = useRef(new Animated.Value(1)).current

  // GPU-accelerated pulse animation for loading state
  useEffect(() => {
    if (isBusy) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isBusy, pulseAnim])

  // Determine the primary action based on the state
  const handlePress = () => {
    if (isBusy) return
    if (error || !hasLocation) {
      onRefresh()
    } else {
      onOpenMap()
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={isBusy}
      className="mx-5 mt-2.5 mb-3"
    >
      <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
        {/* Left Side: Icon & Content */}
        <View className="flex-row items-center flex-1 pr-3">
          {/* Status Indicator Icon */}
          <View className="relative mr-3 justify-center items-center w-8 h-8 bg-gray-100 rounded-full">
            <MapPin size={22} color={error ? '#EF4444' : '#059669'} />
          </View>

          {/* Text Content */}
          <View className="flex-1 justify-center">
            <Animated.View style={{ opacity: pulseAnim }}>
              {isBusy ? (
                <Text className="text-base font-medium text-gray-600 mb-0.5">
                  Obtendo localização...
                </Text>
              ) : error ? (
                <Text
                  className="text-base font-semibold text-red-500 mb-0.5"
                  numberOfLines={1}
                >
                  {error}
                </Text>
              ) : address ? (
                <Text
                  className="text-base font-semibold text-gray-900 mb-0.5"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {address}
                </Text>
              ) : (
                <Text className="text-base font-medium text-gray-500 mb-0.5">
                  Localização não disponível
                </Text>
              )}
            </Animated.View>

            <Text className="text-xs text-gray-500">
              {error
                ? 'Toque para atualizar'
                : isBusy
                  ? 'Aguarde um momento'
                  : 'GPS Ativo'}
            </Text>
          </View>
        </View>

        {/* Right Side: Action Icon */}
        <View className="w-10 h-10 rounded-full bg-red-50 justify-center items-center">
          {isBusy ? (
            <RefreshCw size={20} color="#9CA3AF" />
          ) : error || !hasLocation ? (
            <RefreshCw size={20} color="#b31a24" />
          ) : (
            <Navigation size={20} color="#b31a24" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default LocationStatusCard
