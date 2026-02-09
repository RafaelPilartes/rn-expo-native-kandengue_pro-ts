// src/screens/Ride/components/RideConfirmationFlow.tsx
import React, { useState } from 'react'
import { Modal, View } from 'react-native'
import { useImagePicker } from '@/hooks/useImagePicker'
import { ImagePickerPresets } from '@/services/picker/imagePickerPresets'
import { useFileUploadViewModel } from '@/viewModels/FileUploadViewModel'
import { useAlert } from '@/context/AlertContext'

// Steps
import { PhotoStep } from './steps/PhotoStep'
import { OTPStep } from './steps/OTPStep'

interface RideConfirmationFlowProps {
  visible: boolean
  userId: string | null
  onClose: () => void
  onConfirm: (otp: string, photoUri?: string) => void
  isLoading?: boolean
}

export const RideConfirmationFlow: React.FC<RideConfirmationFlowProps> = ({
  visible,
  onClose,
  onConfirm,
  userId = 'under',
  isLoading = false
}) => {
  const {
    uploadSomeImageForUser,
    isUploadingSomeImageForUser: isUploadingRideImage,
    uploadSomeImageForUserError: uploadRideErrorImage
  } = useFileUploadViewModel()

  const { showAlert } = useAlert()

  const [currentStep, setCurrentStep] = useState<'photo' | 'otp'>('photo')
  const [otpCode, setOtpCode] = useState('')
  const [ridePhoto, setRidePhoto] = useState<string | null>(null)

  const { takePhoto, isUploading: isPickingImage } = useImagePicker()

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto(
        ImagePickerPresets.GENERAL.config,
        ImagePickerPresets.GENERAL.validation
      )

      if (imageUri) {
        setRidePhoto(imageUri)
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Não foi possível capturar a foto',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
    }
  }

  const handleRemovePhoto = () => {
    setRidePhoto(null)
  }

  const handleContinueToOTP = () => {
    if (!ridePhoto) {
      showAlert({
        title: 'Atenção',
        message: 'Por favor, tire uma foto da encomenda antes de continuar',
        type: 'warning',
        buttons: [{ text: 'OK' }]
      })
      return
    }
    setCurrentStep('otp')
  }

  const handleBackToPhoto = () => {
    setCurrentStep('photo')
  }

  const handleUploadImage = async (): Promise<string> => {
    if (!ridePhoto) return ''

    try {
      const { url, path } = await uploadSomeImageForUser({
        fileUri: ridePhoto,
        userId: userId || '',
        imageType: 'ride'
      })

      if (!url || !path) {
        const errorMsg =
          uploadRideErrorImage?.message || 'Erro ao carregar ficheiro'
        console.error('❌ Upload falhou:', errorMsg)
        showAlert({
          title: 'Erro na imagem',
          message: errorMsg,
          type: 'error',
          buttons: [{ text: 'OK' }]
        })
        throw new Error('Upload inválido')
      }

      console.log('✅ Upload concluído:', url)
      return url
    } catch (err) {
      console.error('❌ Erro no upload:', err)
      showAlert({
        title: 'Erro',
        message: 'Erro ao carregar ficheiro, tente tirar outra fotografia',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      throw err
    }
  }

  const handleConfirmRide = async () => {
    if (otpCode.length !== 4) {
      showAlert({
        title: 'Erro',
        message: 'Digite o código OTP de 4 dígitos',
        type: 'error',
        buttons: [{ text: 'OK' }]
      })
      return
    }
    try {
      let finalRidePhotoUrl = await handleUploadImage()

      onConfirm(otpCode, finalRidePhotoUrl || undefined)
    } catch (error) {
      console.error('Erro na imagem:', error)
    }
  }

  const handleClose = () => {
    setCurrentStep('photo')
    setOtpCode('')
    setRidePhoto(null)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {currentStep === 'photo' ? (
          <PhotoStep
            onClose={handleClose}
            onTakePhoto={handleTakePhoto}
            photoUri={ridePhoto}
            onRemovePhoto={handleRemovePhoto}
            onContinue={handleContinueToOTP}
            isLoading={isLoading || isUploadingRideImage}
            isPickingImage={isPickingImage}
          />
        ) : (
          <OTPStep
            onClose={handleClose}
            onBack={handleBackToPhoto}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            onConfirm={handleConfirmRide}
            photoUri={ridePhoto}
            isLoading={isLoading || isUploadingRideImage}
          />
        )}
      </View>
    </Modal>
  )
}
