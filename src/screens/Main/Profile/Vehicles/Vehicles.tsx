// src/screens/driver/Vehicles.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native'
import {
  Plus,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  Trash2
} from 'lucide-react-native'
import VehicleModal from './components/VehicleModal'
import PageHeader from '@/components/PageHeader'
import { VehicleInterface } from '@/interfaces/IVehicle'
import { useVehiclesViewModel } from '@/viewModels/VehicleViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { VehicleType } from '@/types/enum'
import { useFileUploadViewModel } from '@/viewModels/FileUploadViewModel'
import { BaseLoadingPage } from '@/components/loadingPage'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function VehiclesScreen() {
  const { driver } = useAuthStore()
  const {
    fetchAllVehiclesByField,
    createVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehiclesViewModel()

  const {
    uploadSomeImageForUser,
    isUploadingSomeImageForUser: isUploadingImageImage,
    uploadSomeImageForUserError: uploadImageErrorImage
  } = useFileUploadViewModel()

  const [vehicles, setVehicles] = useState<VehicleInterface[]>([])
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleInterface | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔹 Status do veículo
  const renderStatus = (status: VehicleInterface['status']) => {
    const statusConfig = {
      validated: { icon: CheckCircle2, color: '#10B981', label: 'Aprovado' },
      under_analysis: { icon: Clock, color: '#F59E0B', label: 'Pendente' },
      rejected: { icon: XCircle, color: '#EF4444', label: 'Rejeitado' }
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.under_analysis
    const IconComponent = config.icon

    return (
      <View className="flex-row items-center">
        <IconComponent size={16} color={config.color} />
        <Text
          className="ml-1 text-xs font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
      </View>
    )
  }

  // 🔹 UPLOAD: de imagem - FUNÇÃO ADICIONADA
  const handleUploadImage = async (imageToUpload: string): Promise<string> => {
    if (!imageToUpload) return imageToUpload || ''

    try {
      console.log('📤 Iniciando upload da imagem...')

      const { url, path } = await uploadSomeImageForUser({
        fileUri: imageToUpload,
        userId: driver?.id || '',
        imageType: 'vehicles'
      })

      if (!url || !path) {
        const errorMsg =
          uploadImageErrorImage?.message || 'Erro ao carregar ficheiro'
        console.error('❌ Upload falhou:', errorMsg)
        Alert.alert('Erro', errorMsg)
        throw new Error('Upload inválido')
      }

      console.log('✅ Upload concluído:', url)
      return url
    } catch (err) {
      console.error('❌ Erro no upload:', err)
      Alert.alert('Erro', 'Erro ao carregar ficheiro')
      throw err
    }
  }

  // 🔹 Manipular salvamento do veículo
  const handleSaveVehicle = async (vehicleData: Partial<VehicleInterface>) => {
    setIsSubmitting(true)

    try {
      let finalImageUrl = vehicleToEdit?.image

      // 🔹 FAZER UPLOAD se há nova imagem selecionada
      if (vehicleData.image && vehicleData.image !== vehicleToEdit?.image) {
        console.log('🔄 Fazendo upload da nova imagem...')
        finalImageUrl = await handleUploadImage(vehicleData.image)
      }

      // 🔹 PREPARAR dados para atualização
      const updateData: Partial<VehicleInterface> = {
        ...vehicleData
      }

      // 🔹 ADICIONAR foto apenas se mudou
      if (finalImageUrl !== vehicleToEdit?.image) {
        updateData.image = finalImageUrl
      }

      if (vehicleToEdit?.id) {
        // Editar veículo existente
        await updateVehicle.mutateAsync({
          id: vehicleToEdit.id,
          vehicle: {
            ...updateData,
            status: 'under_analysis',
            isDefault: false
          }
        })
      } else {
        // Criar novo veículo
        const createdVehicle: Omit<VehicleInterface, 'id'> = {
          ...updateData,
          user_id: driver?.id || '',
          type: vehicleData.type as VehicleType,
          brand: vehicleData.brand as string,
          model: vehicleData.model as string,
          color: vehicleData.color as string,
          plate: vehicleData.plate as string,
          status: 'under_analysis',
          isDefault: false
        }
        await createVehicle.mutateAsync(createdVehicle)
      }

      setShowModal(false)
      setVehicleToEdit(null)

      Alert.alert(
        'Sucesso',
        vehicleToEdit ? 'Veículo atualizado!' : 'Veículo adicionado!'
      )
    } catch (error) {
      console.error('Erro ao salvar veículo:', error)
      Alert.alert('Erro', 'Não foi possível salvar o veículo. Tente novamente.')
    } finally {
      if (driver) {
        fetchAllVehicles()
      }
      setIsSubmitting(false)
    }
  }

  // 🔹 Excluir veículo
  const handleDeleteVehicle = (vehicle: VehicleInterface) => {
    Alert.alert(
      'Excluir Veículo',
      `Tem certeza que deseja excluir ${vehicle.brand} ${vehicle.model}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle.mutateAsync(vehicle.id!)
              if (driver) {
                fetchAllVehicles()
              }
              Alert.alert('Sucesso', 'Veículo excluído!')
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o veículo')
            }
          }
        }
      ]
    )
  }

  // 🔹 Abrir modal para editar
  const handleEditVehicle = (vehicle: VehicleInterface) => {
    setVehicleToEdit(vehicle)
    setShowModal(true)
  }

  // 🔹 Abrir modal para adicionar
  const handleAddVehicle = () => {
    setVehicleToEdit(null)
    setShowModal(true)
  }

  // fetch all vehicles
  const fetchAllVehicles = async () => {
    try {
      const vehiclesResponse = await fetchAllVehiclesByField(
        'user_id',
        driver?.id as string
      )
      setVehicles(vehiclesResponse?.data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setIsFetchingVehicles(false)
    }
  }

  useEffect(() => {
    if (driver) {
      fetchAllVehicles()
    }
  }, [driver])

  if (isFetchingVehicles) {
    return (
      <BaseLoadingPage
        title="Meus Veículos"
        primaryText={'Buscando veículos...'}
      />
    )
  }

  return (
    <View className="relative flex-1 bg-gray-50 m-safe">
      {/* Header */}
      <PageHeader title="Meus Veículos" canGoBack={true} />

      <ScrollView className="flex-1 p-4">
        {/* Lista de Veículos */}
        {vehicles.length > 0 ? (
          vehicles.map(vehicle => (
            <View
              key={vehicle.id}
              className="bg-white rounded-2xl shadow-sm mb-4 p-4 border border-gray-100"
            >
              <View className="flex-row items-start">
                {/* Imagem do Veículo */}
                <View className="mr-4">
                  {vehicle.image ? (
                    <Image
                      source={{ uri: vehicle.image ?? '' }}
                      className="w-20 h-20 rounded-xl"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
                      <Car size={28} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Informações */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {vehicle.brand} {vehicle.model}
                      </Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        {vehicle.type} • {vehicle.color}
                      </Text>
                    </View>

                    {/* Status */}
                    {renderStatus(vehicle.status || 'pending')}
                  </View>

                  {/* Ações */}
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <Text className="text-xs text-gray-500">
                      {vehicle.isDefault && '⭐ Veículo Principal'}
                    </Text>

                    <View className="flex-row gap-3">
                      {vehicle.status !== 'validated' && (
                        <TouchableOpacity
                          onPress={() => handleEditVehicle(vehicle)}
                          className="flex-row items-center"
                        >
                          <Edit3 size={16} color="#6B7280" />
                          <Text className="ml-1 text-xs text-gray-600">
                            Editar
                          </Text>
                        </TouchableOpacity>
                      )}

                      {!vehicle.isDefault && (
                        <TouchableOpacity
                          onPress={() => handleDeleteVehicle(vehicle)}
                          className="flex-row items-center ml-3"
                        >
                          <Trash2 size={16} color="#EF4444" />
                          <Text className="text-xs text-red-600">Excluir</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          // Estado Vazio
          <View className="items-center justify-center py-16">
            <Car size={64} color="#D1D5DB" />
            <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
              Nenhum veículo cadastrado
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Adicione seu primeiro veículo para começar
            </Text>
          </View>
        )}

        {/* Informações */}
        <View className="mt-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-sm font-medium text-blue-800 mb-2">
            💡 Informações
          </Text>
          <Text className="text-xs text-blue-600">
            • Você pode ter múltiplos veículos
          </Text>
          <Text className="text-xs text-blue-600 mt-1">
            • Um veículo precisa ser aprovado antes de usar
          </Text>
          <Text className="text-xs text-blue-600 mt-1">
            • Foto do veículo ajuda na verificação
          </Text>
        </View>
      </ScrollView>

      {/* Botão Adicionar (sempre visível) */}
      <TouchableOpacity
        onPress={handleAddVehicle}
        className="absolute bottom-10 left-6 p-5 flex-row items-center justify-center bg-red-600 rounded-full shadow-lg"
      >
        <Plus size={22} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <VehicleModal
        visible={showModal}
        onClose={() => {
          setShowModal(false)
          setVehicleToEdit(null)
        }}
        onSave={handleSaveVehicle}
        vehicleToEdit={vehicleToEdit}
        isEditing={isSubmitting}
      />
    </View>
  )
}
