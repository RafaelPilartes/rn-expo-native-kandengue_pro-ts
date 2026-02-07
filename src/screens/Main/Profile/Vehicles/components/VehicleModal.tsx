// src/screens/Main/Profile/Vehicles/components/VehicleModal.tsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { X, Camera, Image as ImageIcon, Trash2, Car } from 'lucide-react-native'
import { useImagePicker } from '@/hooks/useImagePicker'
import { ImagePickerPresets } from '@/services/picker/imagePickerPresets'
import { VehicleInterface } from '@/interfaces/IVehicle'
import PrimaryButton from '@/components/ui/button/PrimaryButton'
import { SelectField } from '@/components/ui/select/SelectField'
import { vehicleTypeOptions } from '@/data/selectOption'
import { InputField } from '@/components/ui/input/InputField'

type Props = {
  visible: boolean
  onClose: () => void
  onSave: (vehicle: Partial<VehicleInterface>) => void
  vehicleToEdit?: Partial<VehicleInterface> | null
  isEditing?: boolean
}

export default function VehicleModal({
  visible,
  onClose,
  onSave,
  vehicleToEdit,
  isEditing = false
}: Props) {
  const { pickImage, takePhoto, clearError } = useImagePicker()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Partial<VehicleInterface>>({
    type: 'motorcycle',
    brand: '',
    model: '',
    plate: '',
    color: '',
    image: undefined
  })

  // 🔹 Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (vehicleToEdit) {
        setFormData({
          type: vehicleToEdit.type || 'motorcycle',
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          plate: vehicleToEdit.plate || '',
          color: vehicleToEdit.color || '',
          image: vehicleToEdit.image || undefined,
          id: vehicleToEdit.id
        })
        setSelectedFile(vehicleToEdit.image || null)
      } else {
        setFormData({
          type: 'motorcycle',
          brand: '',
          model: '',
          plate: '',
          color: '',
          image: undefined
        })
        setSelectedFile(null)
      }
      setErrors({})
    }
  }, [vehicleToEdit, visible])

  const handleChange = (field: keyof VehicleInterface, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.brand?.trim()) newErrors.brand = 'Marca é obrigatória'
    if (!formData.model?.trim()) newErrors.model = 'Modelo é obrigatório'
    if (!formData.plate?.trim()) newErrors.plate = 'Placa é obrigatória'
    if (!formData.color?.trim()) newErrors.color = 'Cor é obrigatória'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePickImage = async () => {
    clearError()
    try {
      const imageUri = await pickImage(
        ImagePickerPresets.PROFILE.config,
        ImagePickerPresets.PROFILE.validation
      )
      if (imageUri) {
        setSelectedFile(imageUri)
        setFormData(prev => ({ ...prev, image: imageUri }))
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a galeria.')
    }
  }

  const handleTakePhoto = async () => {
    clearError()
    try {
      const imageUri = await takePhoto(
        ImagePickerPresets.PROFILE.config,
        ImagePickerPresets.PROFILE.validation
      )
      if (imageUri) {
        setSelectedFile(imageUri)
        setFormData(prev => ({ ...prev, image: imageUri }))
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a câmera.')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }))
    setSelectedFile(null)
  }

  const handleSave = () => {
    if (!validateForm()) return
    const formattedForm = {
      ...formData,
      plate: formData.plate?.replace(/\s/g, '').toUpperCase() || ''
    }
    onSave(formattedForm)
  }

  // 🔹 Check if form has basic data
  const canSave =
    formData.brand?.trim() &&
    formData.model?.trim() &&
    formData.plate?.trim() &&
    !isEditing

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-3xl h-[85%] overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
                <View>
                  <Text className="text-xl font-bold text-gray-900">
                    {vehicleToEdit ? 'Editar Veículo' : 'Novo Veículo'}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-0.5">
                    Preencha os dados do veículo
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                >
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
              >
                {/* Image Section */}
                <View className="items-center mb-6">
                  <View className="relative w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden items-center justify-center">
                    {formData.image ? (
                      <Image
                        source={{ uri: formData.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center opacity-40">
                        <Car size={48} color="#9CA3AF" />
                        <Text className="text-gray-900 font-medium mt-2">
                          Foto da Viatura
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          Opcional, mas recomendado
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Image Actions */}
                  <View className="flex-row mt-4 gap-3 w-full">
                    <TouchableOpacity
                      onPress={handlePickImage}
                      className="flex-1 bg-blue-50 py-3 rounded-xl flex-row items-center justify-center active:bg-blue-100"
                    >
                      <ImageIcon size={18} color="#2563EB" />
                      <Text className="ml-2 font-semibold text-blue-700 text-xs">
                        Galeria
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleTakePhoto}
                      className="flex-1 bg-blue-50 py-3 rounded-xl flex-row items-center justify-center active:bg-blue-100"
                    >
                      <Camera size={18} color="#2563EB" />
                      <Text className="ml-2 font-semibold text-blue-700 text-xs">
                        Câmera
                      </Text>
                    </TouchableOpacity>

                    {formData.image && (
                      <TouchableOpacity
                        onPress={handleRemoveImage}
                        className="w-12 items-center justify-center bg-red-50 rounded-xl active:bg-red-100"
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Form Fields - Modern Inputs */}
                <View className="space-y-4">
                  <SelectField
                    label="Tipo de Veículo"
                    placeholder="Selecione..."
                    options={vehicleTypeOptions}
                    value={formData.type}
                    error={errors.type}
                    onSelect={value => handleChange('type', value)}
                  />

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <InputField
                        label="Marca"
                        placeholder="Ex: Toyota"
                        value={formData.brand}
                        error={errors.brand}
                        onChangeText={text => handleChange('brand', text)}
                      />
                    </View>
                    <View className="flex-1">
                      <InputField
                        label="Modelo"
                        placeholder="Ex: Yaris"
                        value={formData.model}
                        error={errors.model}
                        onChangeText={text => handleChange('model', text)}
                      />
                    </View>
                  </View>

                  <InputField
                    label="Matrícula"
                    placeholder="LD-00-00-AA"
                    value={formData.plate}
                    error={errors.plate}
                    onChangeText={text => handleChange('plate', text)}
                    autoCapitalize="characters"
                  />

                  <InputField
                    label="Cor"
                    placeholder="Ex: Branco"
                    value={formData.color}
                    error={errors.color}
                    onChangeText={text => handleChange('color', text)}
                  />
                </View>

                {/* Submit Logic */}
                <View className="mt-8">
                  <PrimaryButton
                    onPress={handleSave}
                    label={
                      vehicleToEdit ? 'Salvar Alterações' : 'Adicionar Veículo'
                    }
                    disabled={!canSave || isEditing}
                    loading={isEditing}
                  />
                  {!canSave && (
                    <Text className="text-center text-gray-400 text-xs mt-3">
                      Preencha todos os campos obrigatórios (*)
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}
