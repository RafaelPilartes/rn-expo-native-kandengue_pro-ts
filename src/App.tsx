import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'

import '@/styles/global.css'
import '@/i18n'
import AppRouter from '@/routers'
import { STORAGE_TYPE } from '@/storage/constants'
import { StorageManager } from '@/storage/storageManager'
import { useTranslation } from './hooks/useTranslation'
import { useAppStore } from './storage/store/useAppStore'
import { ThemeProvider } from './providers/ThemeProvider'
import { NavigationContainer } from '@react-navigation/native'
import { NetworkProvider } from './providers/NetworkProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocationProvider } from './context/LocationContext'
import { TrackRideProvider } from './context/TrackRideContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NetworkStatusBanner } from './components/NetworkStatusBanner'

const queryClient = new QueryClient()

function App() {
  const { language } = useAppStore()
  const { changeLanguage, ready } = useTranslation()

  async function StoragePrepareApp() {
    await StorageManager.initialize(STORAGE_TYPE.MMKV)
  }

  useEffect(() => {
    console.log('Aguardando tradução...')

    if (ready) {
      changeLanguage(language)
      console.log('Aplicando idioma:', language)
    }
  }, [ready, language])

  useEffect(() => {
    const init = async () => {
      await StoragePrepareApp()
    }
    init()
  }, [])

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                <LocationProvider>
                  <TrackRideProvider>
                    <NetworkProvider>
                      <StatusBar style="dark" />
                      <NetworkStatusBanner />
                      <AppRouter />
                    </NetworkProvider>
                  </TrackRideProvider>
                </LocationProvider>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

export default App
