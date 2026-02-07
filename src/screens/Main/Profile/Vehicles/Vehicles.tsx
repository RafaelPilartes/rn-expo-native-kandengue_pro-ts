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
  Edit2,
  Trash2,
  MoreVertical,
  Star
} from 'lucide-react-native'
import VehicleModal from './components/VehicleModal'
import PageHeader from '@/components/PageHeader'
import { VehicleInterface } from '@/interfaces/IVehicle'
import { useVehiclesViewModel } from '@/viewModels/VehicleViewModel'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { VehicleType } from '@/types/enum'
import { useFileUploadViewModel } from '@/viewModels/FileUploadViewModel'
import { BaseLoadingPage } from '@/components/loadingPage'

export default function VehiclesScreen() {
  const { driver } = useAuthStore()
  const {
    fetchAllVehiclesByField,
    createVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehiclesViewModel()

  const { uploadSomeImageForUser, uploadSomeImageForUserError } =
    useFileUploadViewModel()

  const [vehicles, setVehicles] = useState<VehicleInterface[]>([])
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleInterface | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔹 Fetch vehicles
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

  // 🔹 Upload Image Logic
  const handleUploadImage = async (imageToUpload: string): Promise<string> => {
    if (!imageToUpload) return ''

    try {
      const { url, path } = await uploadSomeImageForUser({
        fileUri: imageToUpload,
        userId: driver?.id || '',
        imageType: 'vehicles'
      })

      if (!url || !path) {
        throw new Error(
          uploadSomeImageForUserError?.message || 'Erro ao carregar imagem'
        )
      }
      return url
    } catch (err) {
      console.error('Upload failed:', err)
      Alert.alert('Erro', 'Falha ao fazer upload da imagem.')
      throw err
    }
  }

  // 🔹 Save Vehicle
  const handleSaveVehicle = async (vehicleData: Partial<VehicleInterface>) => {
    setIsSubmitting(true)
    try {
      let finalImageUrl = vehicleToEdit?.image

      if (vehicleData.image && vehicleData.image !== vehicleToEdit?.image) {
        finalImageUrl = await handleUploadImage(vehicleData.image)
      }

      const updateData: Partial<VehicleInterface> = { ...vehicleData }
      if (finalImageUrl !== vehicleToEdit?.image) {
        updateData.image = finalImageUrl
      }

      if (vehicleToEdit?.id) {
        await updateVehicle.mutateAsync({
          id: vehicleToEdit.id,
          vehicle: {
            ...updateData,
            status: 'under_analysis',
            isDefault: vehicleToEdit.isDefault
          }
        })
      } else {
        await createVehicle.mutateAsync({
          ...updateData,
          user_id: driver?.id || '',
          type: vehicleData.type as VehicleType,
          brand: vehicleData.brand as string,
          model: vehicleData.model as string,
          color: vehicleData.color as string,
          plate: vehicleData.plate as string,
          status: 'under_analysis',
          isDefault: vehicles.length === 0 // First vehicle is default by default
        } as any)
      }

      setShowModal(false)
      setVehicleToEdit(null)
      Alert.alert(
        'Sucesso',
        vehicleToEdit
          ? 'Veículo atualizado e enviado para análise.'
          : 'Veículo adicionado com sucesso!'
      )
      fetchAllVehicles()
    } catch (error) {
      console.error('Save error:', error)
      Alert.alert('Erro', 'Não foi possível salvar o veículo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🔹 Delete Vehicle
  const handleDeleteVehicle = (vehicle: VehicleInterface) => {
    Alert.alert(
      'Excluir Veículo',
      `Tem certeza que deseja remover ${vehicle.brand} ${vehicle.model}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle.mutateAsync(vehicle.id!)
              fetchAllVehicles()
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir veículo.')
            }
          }
        }
      ]
    )
  }

  // 🔹 Open Modals
  const handleEditVehicle = (vehicle: VehicleInterface) => {
    setVehicleToEdit(vehicle)
    setShowModal(true)
  }

  const handleAddVehicle = () => {
    setVehicleToEdit(null)
    setShowModal(true)
  }

  // 🔹 Render Status Badge
  const renderStatusBadge = (status: VehicleInterface['status']) => {
    switch (status) {
      case 'validated':
        return (
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg border border-green-100">
            <CheckCircle2 size={12} color="#166534" />
            <Text className="ml-1.5 text-[10px] uppercase font-bold text-green-800">
              Aprovado
            </Text>
          </View>
        )
      case 'rejected':
        return (
          <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-lg border border-red-100">
            <XCircle size={12} color="#991B1B" />
            <Text className="ml-1.5 text-[10px] uppercase font-bold text-red-800">
              Rejeitado
            </Text>
          </View>
        )
      default:
        return (
          <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
            <Clock size={12} color="#B45309" />
            <Text className="ml-1.5 text-[10px] uppercase font-bold text-amber-800">
              Análise
            </Text>
          </View>
        )
    }
  }

  if (isFetchingVehicles) {
    return (
      <BaseLoadingPage
        title="Meus Veículos"
        primaryText={'Carregando sua frota...'}
      />
    )
  }

  return (
    <View className="flex-1 bg-gray-50 m-safe">
      <PageHeader title="Meus Veículos" canGoBack={true} />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.length > 0 ? (
          vehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              activeOpacity={0.7}
              onPress={() => handleEditVehicle(vehicle)}
              className="bg-white rounded-3xl mb-4 overflow-hidden shadow-sm border border-gray-100"
              style={{
                shadowColor: '#2424244b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2
              }}
            >
              {/* Status Badge on Image */}
              <View className="flex-row px-4 mt-4 relative">
                {renderStatusBadge(vehicle.status)}
              </View>

              <View className="flex-row p-4 relative">
                {/* Image */}
                <View className=" mr-4">
                  {vehicle.image ? (
                    <Image
                      source={{ uri: vehicle.image }}
                      className="w-24 h-24 rounded-2xl bg-gray-100"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-24 h-24 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100">
                      <Car size={32} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View className="flex-1 justify-between py-1">
                  <View>
                    <Text className="text-lg font-bold text-gray-900 leading-tight mb-1">
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <Text className="text-sm text-gray-500 font-medium capitalize">
                      {vehicle.color} • {vehicle.plate}
                    </Text>
                  </View>

                  {/* Badges Row */}
                  <View className="flex-row gap-2 mt-2">
                    <View className="bg-gray-100 px-2 py-1 rounded-lg">
                      <Text className="text-[10px] font-bold text-gray-600 uppercase">
                        {vehicle.type === 'motorcycle' ? 'Moto' : 'Carro'}
                      </Text>
                    </View>
                    {driver?.vehicle?.id === vehicle.id && (
                      <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <CheckCircle2
                          size={10}
                          color="#059669"
                          fill="#059669"
                        />
                        <Text className="ml-1 text-[10px] font-bold text-emerald-700 uppercase">
                          Em Uso
                        </Text>
                      </View>
                    )}
                    {vehicle.isDefault && (
                      <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        <Star size={10} color="#2563EB" fill="#2563EB" />
                        <Text className="ml-1 text-[10px] font-bold text-blue-700 uppercase">
                          Principal
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Actions Footer */}
              {!vehicle.isDefault && (
                <View className="px-4 pb-3 pt-2 border-t border-gray-100 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => handleDeleteVehicle(vehicle)}
                    className="flex-row items-center px-3 py-2 active:bg-red-50 rounded-xl"
                  >
                    <Trash2 size={14} color="#EF4444" />
                    <Text className="ml-1.5 text-xs font-semibold text-red-600">
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-20 opacity-80">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Car size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Nenhum veículo
            </Text>
            <Text className="text-gray-500 text-center mt-2 px-10 leading-relaxed text-sm">
              Adicione os veículos que você utilizará para trabalhar na
              plataforma.
            </Text>
          </View>
        )}

        {/* Info Box */}
        {vehicles.length > 0 && (
          <View className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 mb-6">
            <Text className="text-sm font-bold text-blue-900 mb-2">
              Dicas Importantes
            </Text>
            <View className="space-y-1">
              <Text className="text-xs text-blue-800/80 leading-relaxed">
                • Mantenha os dados do veículo sempre atualizados.
              </Text>
              <Text className="text-xs text-blue-800/80 leading-relaxed">
                • A foto do veículo deve ser clara e mostrar a placa.
              </Text>
              <Text className="text-xs text-blue-800/80 leading-relaxed">
                • Veículos em análise não podem receber corridas.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB - Enhanced */}
      <TouchableOpacity
        onPress={handleAddVehicle}
        className="absolute bottom-8 right-6 w-16 h-16 items-center justify-center rounded-full shadow-lg"
        style={{
          backgroundColor: '#b31a24',
          shadowColor: '#b31a24',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

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
