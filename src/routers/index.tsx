// AppRouter.tsx - VERSÃO COM AUTENTICAÇÃO REAL
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthRouter from './navigation/AuthRouter'
import TabRouter from './Tab/TabRouter'
import LoadingScreen from '@/screens/Loading'
import { Alert, Platform } from 'react-native'
import Constants from 'expo-constants'
import VersionCheck from 'react-native-version-check'

import { useAuthStore } from '@/storage/store/useAuthStore'
import { DriverInterface } from '@/interfaces/IDriver'
import UpdateAppScreen from '@/screens/UpdateApp'
import { AppConfigInfo } from '@/constants/config'
import { useAuthViewModel } from '@/viewModels/AuthViewModel'
import { useAlert } from '@/context/AlertContext'

const Stack = createNativeStackNavigator()

export default function AppRouter() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [isCheckingVersion, setIsCheckingVersion] = useState(true)
  const [lastVersionAvailable, setLastVersionAvailable] = useState<
    string | null
  >(null)
  const [hasUpdated, setHasUpdated] = useState(false)

  // ViewModel (React Query + use cases)
  const {
    currentDriver, // DriverInterface | null (comes from authUseCase.getCurrentDriver)
    isAuthenticated: isFirebaseAuthenticated, // boolean (derived in VM)
    isLoading: authLoading, // loading state for the query
    refetchDriver, // function to re-fetch current driver from Firebase
    checkEmailVerification, // mutation object (use mutateAsync)
    logout: logoutMutation // mutation object (use mutateAsync)
  } = useAuthViewModel()

  // Zustand store (persisted via MMKV)
  const {
    driver: zustandDriver,
    setDriver: setZustandDriver,
    logout: zustandLogout
  } = useAuthStore()

  const { showAlert } = useAlert()

  // =========================================================
  // 🔹 FUNÇÃO AUXILIAR: Validations for app access — adapta conforme os campos reais do DriverInterface
  // =========================================================
  const isUserValidForApp = (driver: DriverInterface | null): boolean => {
    if (!driver) return false

    // Ajusta estes campos de acordo com a tua entidade DriverInterface
    const hasEmail = !!(driver.email && driver.email.length)
    const hasName = !!(driver.name && driver.name.length)
    const isActive = driver.status ? driver.status !== 'banned' : true
    const isVerified = driver.email_verified ?? true

    if (!hasEmail || !hasName) {
      console.log('❌ Dados do driver incompletos')
      return false
    }

    if (!isVerified) {
      console.log('❌ Email não verificado')
      return false
    }

    if (!isActive) {
      console.log('❌ Driver com status não ativo')
      return false
    }

    return true
  }

  // =========================================================
  // 🔹 SINCRONIZAR ESTADOS: Sincroniza Zustand com estado retornado pelo ViewModel (Firebase)
  // =========================================================
  const syncAuthState = async () => {
    try {
      console.log('🔄 Sincronizando estado de autenticação...')

      // Se Firebase tem um driver autenticado
      if (currentDriver && isFirebaseAuthenticated) {
        // Verifica email via mutation exposta (se existir)
        let isEmailVerified = false

        try {
          // checkEmailVerification é um objeto de mutation (useMutation)
          // se não existir no VM, este call falhará e assumimos false temporariamente
          if (checkEmailVerification?.mutateAsync) {
            isEmailVerified = await checkEmailVerification.mutateAsync()
          }
        } catch (e) {
          console.warn(
            '⚠️ Falha ao verificar email (assumindo estado atual).',
            e
          )
        }

        const isValid = isUserValidForApp(currentDriver) && !!isEmailVerified

        if (isValid) {
          // sincroniza Zustand apenas se necessário
          if (!zustandDriver || zustandDriver.id !== currentDriver.id) {
            console.log('✅ Sincronizando Zustand com driver válido')
            setZustandDriver(currentDriver)
          }
        } else {
          console.log('❌ Driver inválido para uso no app — forçando logout')
          await handleInvalidDriver(currentDriver)
        }
      } else {
        // Não há driver no Firebase — garantir que Zustand esteja limpo
        if (zustandDriver) {
          console.log('🔄 Firebase não possui driver; limpando Zustand')
          zustandLogout()
        }
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar autenticação:', error)
    }
  }

  // =========================================================
  // 🔹 FUNÇÃO: Cleanup & notificações quando driver inválido
  // =========================================================
  const handleInvalidDriver = async (driver: DriverInterface | null) => {
    try {
      // Executa logout no servidor (Firebase) se a mutation existir
      try {
        if (logoutMutation?.mutateAsync) {
          await logoutMutation.mutateAsync()
        }
      } catch (e) {
        console.warn('⚠️ Falha no logout via mutation (continuando).', e)
      }

      // Limpa Zustand local
      zustandLogout()

      // Mostra alerta adequado
      if (driver) {
        const isVerified = driver.email_verified ?? false
        const status = driver.status ?? 'active'

        if (!isVerified) {
          showAlert({
            title: 'Email não verificado',
            message: 'Por favor, verifique seu email antes de acessar o aplicativo.',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
        } else if (status !== 'active') {
          showAlert({
            title: 'Conta inativa',
            message: 'Sua conta está inativa. Entre em contato com o suporte.',
            type: 'error',
            buttons: [{ text: 'OK' }]
          })
        }
      } else {
        // fallback genérico
        showAlert({
          title: 'Acesso negado',
          message: 'Conta inválida. Faça login novamente ou contate o suporte.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Erro ao tratar usuário inválido:', error)
    }
  }

  // =========================================================
  // 🔹 INICIALIZAÇÃO DO APP: Inicialização: refetch + sincronização
  // =========================================================
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      console.log('🚀 Inicializando AppRouter...')

      try {
        // 1) Recarrega driver atual do Firebase (via React Query in VM)
        if (refetchDriver) {
          await refetchDriver()
        }

        // 2) Sincroniza Zustand com o resultado
        await syncAuthState()

        // Pequeno delay para smooth UX
        await new Promise(res => setTimeout(res, 650))
      } catch (err) {
        console.error('❌ Erro durante inicialização:', err)
      } finally {
        if (mounted) setIsInitializing(false)
      }
    }

    initialize()
    return () => {
      mounted = false
    }
  }, [])

  // =========================================================
  // 🔹 DEFINIR ACESSO: compute final access flag
  // =========================================================
  const zustandIsAuthed = !!zustandDriver

  const canAccessApp =
    !!currentDriver && // firebase has driver
    isFirebaseAuthenticated && // vm indicates authenticated
    zustandIsAuthed && // persisted local store has driver
    currentDriver?.id === zustandDriver?.id && // same user
    isUserValidForApp(currentDriver)

  console.log('🎯 Estado atual AppRouter:')
  console.log('  Firebase:', isFirebaseAuthenticated)
  console.log('  Zustand:', zustandIsAuthed)
  console.log('  User:', currentDriver?.email || 'Nulo')
  console.log('  Acesso permitido:', canAccessApp)

  async function checkForUpdate() {
    try {
      setIsCheckingVersion(true)

      console.log('🔄 Verificando atualizações...')

      // const androidPackageName = 'com.mercadolibre'
      const androidPackageName = AppConfigInfo.androidPackageName
      const iosBundleIdentifier = AppConfigInfo.iosBundleIdentifier

      if (!androidPackageName) {
        console.log('❌ Não foi possível obter o nome do pacote Android.')
        return
      }
      if (!iosBundleIdentifier) {
        console.log('❌ Não foi possível obter o bundle identifier do iOS.')
        return
      }

      const currentVersion = Constants.expoConfig?.version

      if (!currentVersion) {
        console.log('❌ Não foi possível obter a versão atual.')
        return
      }

      const lastVersion = await VersionCheck.getLatestVersion({
        provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
        packageName:
          Platform.OS === 'ios' ? iosBundleIdentifier : androidPackageName
      })

      console.log('📦 Última versão:', lastVersion)
      console.log('📦 Versão atual:', currentVersion)

      if (lastVersion && lastVersion > currentVersion) {
        console.log('🔄 Nova versão disponível!')
        setLastVersionAvailable(lastVersion)
        setHasUpdated(true)
      } else {
        console.log('✅ Você está usando a versão mais recente.')
        setHasUpdated(false)
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error)
    } finally {
      setIsCheckingVersion(false)
    }
  }

  function handleLater() {
    setHasUpdated(false)
  }

  useEffect(() => {
    checkForUpdate()
  }, [])

  // =========================================================
  // 🔹 LOADING: Enquanto inicializa ou enquanto o VM está carregando: mostra loading
  // =========================================================
  if (isInitializing || authLoading || isCheckingVersion) {
    return <LoadingScreen />
  }

  // =========================================================
  // UPDATE: Se houver atualização, mostra tela de update
  // =========================================================
  if (hasUpdated) {
    return (
      <UpdateAppScreen
        version={lastVersionAvailable || ''}
        onLater={handleLater}
      />
    )
  }

  // =========================================================
  // 🔹 RENDER
  // =========================================================
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!canAccessApp ? (
        <Stack.Screen name="Auth" component={AuthRouter} />
      ) : (
        <Stack.Screen name="Main" component={TabRouter} />
      )}
    </Stack.Navigator>
  )
}
