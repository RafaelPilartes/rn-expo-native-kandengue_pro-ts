// src/components/wallet/ImagePickerButton.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Upload, X } from 'lucide-react-native';

interface ImagePickerButtonProps {
  imageUri: string | null;
  onPickImage: () => void;
  onClearImage: () => void;
  isLoading?: boolean;
  label?: string;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  imageUri,
  onPickImage,
  onClearImage,
  isLoading = false,
  label = 'Carregar comprovativo',
}) => {
  return (
    <TouchableOpacity
      onPress={onPickImage}
      disabled={isLoading}
      className="border-2 border-dashed border-gray-400 rounded-lg h-32 justify-center items-center bg-gray-50"
    >
      {isLoading ? (
        <View className="items-center">
          <ActivityIndicator size="small" color="#EF4444" />
          <Text className="text-gray-500 mt-2">Carregando...</Text>
        </View>
      ) : imageUri ? (
        <View className="w-full h-full rounded-lg relative">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={onClearImage}
            className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
          >
            <X size={14} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center">
          <Upload size={28} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2">{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
