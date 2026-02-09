import { useState, useCallback, useRef, useEffect } from 'react'
import { Platform, PermissionsAndroid } from 'react-native'
import {
  ImagePickerService,
  ImageValidationRules,
  ImagePickerResult
} from '@/services/picker/imagePicker'
import type {
  CameraOptions,
  ImageLibraryOptions
} from 'react-native-image-picker'
import { useAlert } from '@/context/AlertContext'
import { error } from 'console'

interface UseImagePickerReturn {
  pickImage: (
    config?: Partial<ImageLibraryOptions>,
    validation?: ImageValidationRules
  ) => Promise<string | null>
  takePhoto: (
    config?: Partial<CameraOptions>,
    validation?: ImageValidationRules
  ) => Promise<string | null>
  isUploading: boolean
  error: string | null
  clearError: () => void
}

export const useImagePicker = (): UseImagePickerReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)
  const { showAlert } = useAlert()

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // ✅ Versão corrigida
  const safeSetState = useCallback(
    <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      if (isMounted.current) setter(value)
    },
    []
  )

  const clearError = useCallback(
    () => safeSetState(setError as any, null),
    [safeSetState]
  )

  const handleImageSelection = useCallback(
    async (
      pickerFunction: (
        config?: Partial<ImageLibraryOptions>,
        validation?: ImageValidationRules
      ) => Promise<ImagePickerResult>,
      config?: Partial<ImageLibraryOptions>,
      validation?: ImageValidationRules
    ): Promise<string | null> => {
      safeSetState(setIsUploading as any, true)
      safeSetState(setError as any, null)

      try {
        const result = await pickerFunction(config, validation)

        if (result.cancelled) {
          console.log('🟡 Seleção de imagem cancelada pelo usuário')
          return null
        }

        if (!result.success || !result.uri) {
          const msg = result.error || 'Erro ao selecionar imagem'
          console.warn('⚠️ Erro ao selecionar imagem:', msg)
          safeSetState(setError as any, msg)

          if (!result.cancelled) {
            showAlert({
              title: 'Erro',
              message: msg,
              type: 'error',
              buttons: [{ text: 'OK' }]
            })
          }
          return null
        }

        console.log('✅ Imagem selecionada com sucesso:', {
          uri: result.uri,
          size: result.fileSize,
          dimensions: `${result.width}x${result.height}`
        })

        return result.uri
      } catch (error) {
        console.error('❌ Erro no image picker:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'
        safeSetState(setError as any, errorMessage)
        showAlert({
          title: 'Erro',
          message: 'Não foi possível processar a imagem',
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
        return null
      } finally {
        safeSetState(setIsUploading as any, false)
      }
    },
    [safeSetState, showAlert]
  )

  const pickImage = useCallback(
    (
      config?: Partial<ImageLibraryOptions>,
      validation?: ImageValidationRules
    ) => handleImageSelection(ImagePickerService.pickImage, config, validation),
    [handleImageSelection]
  )

  const takePhoto = useCallback(
    async (
      config?: Partial<CameraOptions>,
      validation?: ImageValidationRules
    ): Promise<string | null> => {
      // 🔹 Verificar permissão no Android
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Permissão de Câmera',
              message:
                'O aplicativo precisa de permissão para acessar a câmera para tirar fotos.',
              buttonNeutral: 'Perguntar depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK'
            }
          )
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Permissão de câmera negada')
            showAlert({
              title: 'Permissão negada',
              message:
                'É necessário permitir o acesso à câmera para continuar.',
              type: 'warning',
              buttons: [{ text: 'OK' }]
            })
            return null
          }
        } catch (err) {
          console.warn('Erro ao solicitar permissão de câmera:', err)
          return null
        }
      }

      return handleImageSelection(
        ImagePickerService.takePhoto,
        config,
        validation
      )
    },
    [handleImageSelection]
  )

  return {
    pickImage,
    takePhoto,
    isUploading,
    error,
    clearError
  }
}
