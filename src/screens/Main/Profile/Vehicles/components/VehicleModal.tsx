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

const PRIMARY_COLOR = '#b31a24'

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
          <View className="flex-1 bg-black/60 justify-end py-safe">
            <View className="bg-white rounded-t-[32px] h-[90%] overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    {vehicleToEdit ? 'Editar Veículo' : 'Novo Veículo'}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Preencha os dados do veículo
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                >
                  <X size={22} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingTop: 24,
                  paddingBottom: 120
                }}
              >
                {/* Image Section - Enhanced */}
                <View className="mb-8">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Foto do Veículo
                    <Text className="text-gray-400 font-normal">
                      {' '}
                      (Opcional)
                    </Text>
                  </Text>

                  <View className="relative w-full h-52 bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden items-center justify-center">
                    {formData.image ? (
                      <>
                        <Image
                          source={{ uri: formData.image }}
                          className="w-full h-full bg-gray-100"
                          resizeMode="cover"
                        />
                        {/* Overlay Actions */}
                        <View className="absolute inset-0 bg-black/40 items-center justify-center opacity-0 active:opacity-100">
                          <TouchableOpacity
                            onPress={handleRemoveImage}
                            className="bg-red-600 px-6 py-3 rounded-full flex-row items-center"
                            style={{
                              shadowColor: '#DC2626',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                              elevation: 4
                            }}
                          >
                            <Trash2 size={18} color="white" />
                            <Text className="ml-2 text-white font-bold">
                              Remover
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <View className="items-center">
                        <View className="bg-white p-4 rounded-full shadow-sm mb-3">
                          <Car size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-base">
                          Adicionar Foto
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          Ajuda na identificação
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Image Actions */}
                  <View className="flex-row mt-4 gap-3">
                    <TouchableOpacity
                      onPress={handlePickImage}
                      className="flex-1 bg-red-50 py-4 rounded-2xl flex-row items-center justify-center active:bg-red-100"
                    >
                      <ImageIcon size={20} color={PRIMARY_COLOR} />
                      <Text className="ml-2 font-bold text-red-800 text-sm">
                        Galeria
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleTakePhoto}
                      className="flex-1 bg-red-50 py-4 rounded-2xl flex-row items-center justify-center active:bg-red-100"
                    >
                      <Camera size={20} color={PRIMARY_COLOR} />
                      <Text className="ml-2 font-bold text-red-800 text-sm">
                        Câmera
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Fields - Enhanced Spacing */}
                <View className="space-y-6">
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

                {/* Info Box */}
                <View className="bg-amber-50/50 rounded-2xl p-4 mt-6 border border-amber-100/50">
                  <Text className="text-xs text-amber-900 leading-relaxed">
                    💡 <Text className="font-semibold">Dica:</Text> Veículos são
                    analisados pela equipa antes de serem aprovados para
                    corridas.
                  </Text>
                </View>
              </ScrollView>

              {/* Fixed Bottom Action */}
              <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}
