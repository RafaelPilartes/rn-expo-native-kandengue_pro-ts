// services/picker/imagePicker.ts
import {
  launchImageLibrary,
  ImageLibraryOptions,
  ImagePickerResponse,
  Asset,
  launchCamera,
  CameraOptions
} from 'react-native-image-picker'
import { Alert, Image } from 'react-native'
import { ensureCameraPermission } from '../permissions/cameraPermission'
import { permission } from 'process'

export interface ImagePickerResult {
  success: boolean
  uri?: string
  fileName?: string
  fileSize?: number
  width?: number
  height?: number
  type?: string
  error?: string
  cancelled?: boolean
}

export interface ImageValidationRules {
  maxFileSize?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  allowedFormats?: string[]
  aspectRatio?: [number, number]
}

const DEFAULT_CONFIG: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  includeBase64: false,
  selectionLimit: 1
}

const DEFAULT_VALIDATION: ImageValidationRules = {
  maxFileSize: 5 * 1024 * 1024,
  minWidth: 100,
  minHeight: 100,
  maxWidth: 4096,
  maxHeight: 4096,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  // aspectRatio: [1, 1],
}

// Utilitários
const getFileInfo = async (uri: string) => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    return {
      size: blob.size,
      type: blob.type
    }
  } catch {
    return { size: undefined, type: undefined }
  }
}

const getImageDimensions = (
  uri: string
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      error => reject(error)
    )
  })

// Validador
export class ImageValidator {
  static async validateImage(
    uri: string,
    rules: ImageValidationRules = DEFAULT_VALIDATION
  ) {
    const errors: string[] = []
    const fileInfo = await getFileInfo(uri)

    if (
      fileInfo.size &&
      rules.maxFileSize &&
      fileInfo.size > rules.maxFileSize
    ) {
      const maxSizeMB = rules.maxFileSize / (1024 * 1024)
      errors.push(`A imagem deve ter no máximo ${maxSizeMB}MB`)
    }

    if (
      fileInfo.type &&
      rules.allowedFormats &&
      !rules.allowedFormats.includes(fileInfo.type)
    ) {
      const formats = rules.allowedFormats.map(f => f.split('/')[1]).join(', ')
      errors.push(`Formato não suportado. Use: ${formats}`)
    }

    try {
      const { width, height } = await getImageDimensions(uri)
      if (rules.minWidth && width < rules.minWidth)
        errors.push(`Largura mínima: ${rules.minWidth}px`)
      if (rules.minHeight && height < rules.minHeight)
        errors.push(`Altura mínima: ${rules.minHeight}px`)
      if (rules.maxWidth && width > rules.maxWidth)
        errors.push(`Largura máxima: ${rules.maxWidth}px`)
      if (rules.maxHeight && height > rules.maxHeight)
        errors.push(`Altura máxima: ${rules.maxHeight}px`)

      if (rules.aspectRatio) {
        const [rw, rh] = rules.aspectRatio
        const ratio = width / height
        const expected = rw / rh
        if (Math.abs(ratio - expected) > 0.1)
          errors.push(`Proporção deve ser ${rw}:${rh}`)
      }
    } catch {
      errors.push('Não foi possível verificar as dimensões da imagem')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Serviço principal
export class ImagePickerService {
  static pickImage(
    config: Partial<ImageLibraryOptions> = {},
    validationRules?: ImageValidationRules
  ): Promise<ImagePickerResult> {
    const finalConfig: ImageLibraryOptions = {
      ...DEFAULT_CONFIG,
      ...config
    }

    return new Promise(resolve => {
      launchImageLibrary(finalConfig, async (response: ImagePickerResponse) => {
        try {
          // 🔹 Caso 1: Usuário cancelou
          if (response.didCancel) {
            return resolve({
              success: false,
              cancelled: true,
              error: 'Seleção cancelada'
            })
          }

          // 🔹 Caso 2: Erro no picker
          if (response.errorCode) {
            const errorMessage = this.getErrorMessage(
              response.errorCode,
              response.errorMessage
            )

            return resolve({
              success: false,
              error: `Erro no seletor: ${errorMessage}`
            })
          }

          // 🔹 Caso 3: Nenhuma imagem selecionada
          const asset: Asset | undefined = response.assets?.[0]
          if (!asset?.uri) {
            return resolve({
              success: false,
              error: 'Nenhuma imagem selecionada'
            })
          }

          // 🔹 Caso 4: Validar imagem se necessário
          if (validationRules) {
            const validation = await ImageValidator.validateImage(
              asset.uri,
              validationRules
            )
            if (!validation.isValid) {
              return resolve({
                success: false,
                error: validation.errors.join(', ')
              })
            }
          }

          // 🔹 Caso 5: Sucesso!
          resolve({
            success: true,
            uri: asset.uri,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
            width: asset.width,
            height: asset.height,
            type: asset.type
          })
        } catch (err) {
          console.error('Erro ao processar imagem:', err)
          resolve({ success: false, error: 'Falha ao processar imagem' })
        }
      })
    })
  }

  // 🔹 Novo método
  static takePhoto(
    config: Partial<CameraOptions> = {},
    validationRules?: ImageValidationRules
  ): Promise<ImagePickerResult> {
    const finalConfig: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
      includeBase64: false,
      ...config
    }

    return new Promise(resolve => {
      launchCamera(finalConfig, async (response: ImagePickerResponse) => {
        try {
          const permission = await ensureCameraPermission()

          if (!permission) {
            return { success: false, error: `Permissão de câmera negada` }
          }

          if (response.didCancel) {
            return resolve({
              success: false,
              cancelled: true,
              error: 'Captura cancelada'
            })
          }

          if (response.errorCode) {
            return resolve({
              success: false,
              error: `Erro na câmera: ${ImagePickerService.getErrorMessage(
                response.errorCode,
                response.errorMessage
              )}`
            })
          }

          const asset: Asset | undefined = response.assets?.[0]
          if (!asset?.uri) {
            return resolve({
              success: false,
              error: 'Nenhuma imagem capturada'
            })
          }

          // validação opcional
          if (validationRules) {
            const validation = await ImageValidator.validateImage(
              asset.uri,
              validationRules
            )

            if (!validation.isValid) {
              return resolve({
                success: false,
                error: validation.errors.join(', ')
              })
            }
          }

          return resolve({
            success: true,
            uri: asset.uri,
            fileName: asset.fileName || `photo_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
            width: asset.width,
            height: asset.height,
            type: asset.type
          })
        } catch (err) {
          console.error('Erro ao capturar foto:', err)
          resolve({ success: false, error: 'Falha ao capturar foto' })
        }
      })
    })
  }

  // 🔹 Mapeamento de erros
  private static getErrorMessage(
    errorCode: string,
    errorMessage?: string
  ): string {
    const errorMap: Record<string, string> = {
      camera_unavailable: 'Câmera não disponível',
      permission: 'Permissão negada para acessar a galeria',
      others: errorMessage || 'Erro desconhecido'
    }

    return errorMap[errorCode] || errorMessage || 'Erro ao selecionar imagem'
  }
}
