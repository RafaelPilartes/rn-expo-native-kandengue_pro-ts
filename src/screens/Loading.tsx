import React from 'react'
import { View, ImageBackground, ActivityIndicator, Image } from 'react-native'

import { DefaultTheme } from '@/styles/theme/DefaultTheme'

export default function LoadingScreen() {
  return (
    <View className="bg-red-600 flex-1 items-center justify-center relative">
      <View className="flex flex-col">
        <Image
          source={require('@/assets/logo/png/logo-kandengue-white.png')}
          style={{ width: 240, height: 100, resizeMode: 'contain' }}
        />

        <View className="items-center mt-12">
          <ActivityIndicator color={DefaultTheme.colors.white} size={50} />
        </View>
      </View>
    </View>
  )
}
