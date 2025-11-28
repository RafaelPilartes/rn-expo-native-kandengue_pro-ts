// src/components/driver/VehicleModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { X, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import {
  launchImageLibrary,
  launchCamera,
  Asset,
} from 'react-native-image-picker';
import { useImagePicker } from '@/hooks/useImagePicker';
import { ImagePickerPresets } from '@/services/picker/imagePickerPresets';
import { VehicleInterface } from '@/interfaces/IVehicle';
import PrimaryButton from '@/components/ui/button/PrimaryButton';
import { SelectField } from '@/components/ui/select/SelectField';
import { vehicleTypeOptions } from '@/data/selectOption';
import { InputField } from '@/components/ui/input/InputField';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (vehicle: Partial<VehicleInterface>) => void;
  vehicleToEdit?: Partial<VehicleInterface> | null;
  isEditing?: boolean;
};

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/600x400.png?text=Foto+do+ve%C3%ADculo';

export default function VehicleModal({
  visible,
  onClose,
  onSave,
  vehicleToEdit,
  isEditing = false,
}: Props) {
  const { pickImage, takePhoto, clearError } = useImagePicker();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<VehicleInterface>>({
    type: 'motorcycle',
    brand: '',
    model: '',
    plate: '',
    color: '',
    image: undefined,
  });

  // 🔹 Reset form quando modal abre/fecha
  useEffect(() => {
    if (visible) {
      if (vehicleToEdit) {
        // Modo edição
        setFormData({
          type: vehicleToEdit.type || 'motorcycle',
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          plate: vehicleToEdit.plate || '',
          color: vehicleToEdit.color || '',
          image: vehicleToEdit.image || undefined,
          id: vehicleToEdit.id,
        });
        setSelectedFile(vehicleToEdit.image || null);
      } else {
        // Modo criação
        setFormData({
          type: 'motorcycle',
          brand: '',
          model: '',
          plate: '',
          color: '',
          image: undefined,
        });
        setSelectedFile(null);
      }
      setErrors({});
    }
  }, [vehicleToEdit, visible]);

  // 🔹 Atualizar campo
  const handleChange = (field: keyof VehicleInterface, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🔹 Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand?.trim()) newErrors.brand = 'Marca é obrigatória';
    if (!formData.model?.trim()) newErrors.model = 'Modelo é obrigatório';
    if (!formData.plate?.trim()) newErrors.plate = 'Placa é obrigatória';
    if (!formData.color?.trim()) newErrors.color = 'Cor é obrigatória';
    if (!formData.plate?.trim()) newErrors.color = 'Placa é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Pick from gallery
  const handlePickImage = async () => {
    clearError();
    try {
      const imageUri = await pickImage(
        ImagePickerPresets.PROFILE.config,
        ImagePickerPresets.PROFILE.validation,
      );

      if (imageUri) {
        setSelectedFile(imageUri);
        setFormData(prev => ({
          ...prev,
          image: imageUri,
        }));
      }
    } catch (error) {
      console.error('Erro ao abrir image picker:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    clearError();
    try {
      const imageUri = await takePhoto(
        ImagePickerPresets.PROFILE.config,
        ImagePickerPresets.PROFILE.validation,
      );

      if (imageUri) {
        setSelectedFile(imageUri);
        setFormData(prev => ({
          ...prev,
          image: imageUri,
        }));
      }
    } catch (error) {
      console.error('Erro ao abrir image picker:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  // 🔹 Remover imagem
  const handleRemoveImage = () => {
    Alert.alert('Remover imagem', 'Deseja remover a imagem do veículo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setFormData(prev => ({ ...prev, image: undefined })),
      },
    ]);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Formatar placa (remover espaços e colocar em maiúsculas)
    const formattedForm = {
      ...formData,
      plate: formData.plate?.replace(/\s/g, '').toUpperCase() || '',
    };

    onSave(formattedForm);
  };

  // 🔹 Fechar modal com confirmação se houver alterações
  const handleClose = () => {
    const hasChanges =
      formData.brand !== vehicleToEdit?.brand ||
      formData.model !== vehicleToEdit?.model ||
      formData.plate !== vehicleToEdit?.plate ||
      formData.color !== vehicleToEdit?.color ||
      formData.image !== vehicleToEdit?.image;

    if (hasChanges && !vehicleToEdit?.id) {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja descartar as alterações?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: onClose },
        ],
      );
    } else {
      onClose();
    }
  };

  // 🔹 Verificar se pode salvar
  const canSave =
    formData.brand?.trim() &&
    formData.model?.trim() &&
    formData.plate?.trim() &&
    formData.color?.trim() &&
    !isEditing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-2xl p-6 max-h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {vehicleToEdit ? 'Editar Veículo' : 'Adicionar Veículo'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Imagem */}
            <View className="mb-2">
              {/* Titulo */}
              <Text className="text-gray-700 mb-2">Imagem do veículo</Text>

              <View>
                {/* Preview da Imagem */}
                <View className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 mb-4 border-2 border-dashed border-gray-300">
                  <Image
                    source={{ uri: formData.image || PLACEHOLDER_IMAGE }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>

                {/* Overlay de loading */}
                {(!selectedFile || !formData.image) && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <View className="bg-white/90 rounded-full p-3">
                      <Camera size={24} color="#374151" />
                    </View>
                  </View>
                )}
              </View>

              {formData.image && (
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  className="mt-3 flex-row items-center justify-center"
                >
                  <Trash2 size={16} color="red" />
                  <Text className="ml-2 text-sm text-red-600">
                    Remover imagem
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-lg py-3"
                onPress={handlePickImage}
              >
                <ImageIcon size={16} color="black" />
                <Text className="ml-2 text-sm">Escolher foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-lg py-3"
                onPress={handleTakePhoto}
              >
                <Camera size={16} color="black" />
                <Text className="ml-2 text-sm">Tirar foto</Text>
              </TouchableOpacity>
            </View>

            {/* Campos */}
            <SelectField
              label="Tipo"
              placeholder="Ex: Carro, Moto..."
              options={vehicleTypeOptions}
              value={formData.type}
              error={errors.type}
              onSelect={value => handleChange('type', value)}
            />

            <InputField
              label="Marca"
              placeholder="Ex: Toyota, Honda..."
              value={formData.brand}
              error={errors.brand}
              onChangeText={text => handleChange('brand', text)}
            />
            <InputField
              label="Modelo"
              placeholder="Ex: Corolla, CB 125..."
              value={formData.model}
              error={errors.model}
              onChangeText={text => handleChange('model', text)}
            />
            <InputField
              label="Placa"
              placeholder="Ex: LD-45-89"
              value={formData.plate}
              onChangeText={text => handleChange('plate', text)}
            />
            <InputField
              label="Cor"
              placeholder="Ex: Preto, Vermelho..."
              value={formData.color}
              error={errors.color}
              onChangeText={text => handleChange('color', text)}
            />

            {/* Botão salvar */}
            <PrimaryButton
              className="mt-4"
              onPress={handleSave}
              label={vehicleToEdit ? 'Salvar Alterações' : 'Adicionar Veículo'}
              disabled={!canSave || isEditing}
              loading={isEditing}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
