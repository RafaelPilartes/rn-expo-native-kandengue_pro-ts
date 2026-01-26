import React, { useEffect, useCallback } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'

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
import { ErrorBoundary } from './components/ErrorBoundary'

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

function App() {
  const { language } = useAppStore()
  const { changeLanguage, ready } = useTranslation()
  const [appIsReady, setAppIsReady] = React.useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        await StorageManager.initialize(STORAGE_TYPE.MMKV)
        // Add any other async loading here (fonts, etc.)
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  useEffect(() => {
    if (ready && appIsReady) {
       // Only hide splash screen once
       SplashScreen.hideAsync()
    }
  }, [ready, appIsReady])

  // Apply language only when it changes and we are ready
  // We avoid putting 'changeLanguage' in the dependency array to break the loop
  // if changeLanguage is unstable. Alternatively, fix useTranslation hook.
  // But strictly speaking, if language changes in store, we want to reflect it in i18n.
  useEffect(() => {
     if (ready && language) {
        changeLanguage(language)
     }
  }, [ready, language]) // Removed changeLanguage from deps to be safe, though useTranslation fixes are better.

  if (!appIsReady || !ready) {
    return null
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
