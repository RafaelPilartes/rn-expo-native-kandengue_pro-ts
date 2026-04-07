// src/screens/DocumentsScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { useAlert } from '@/context/AlertContext'
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react-native'
import PageHeader from '@/components/PageHeader'
import { useAuthStore } from '@/storage/store/useAuthStore'
import { useDocumentsViewModel } from '@/viewModels/DocumentViewModel'
import { useFileUploadViewModel } from '@/viewModels/FileUploadViewModel'
import { useImagePicker } from '@/hooks/useImagePicker'
import { ImagePickerPresets } from '@/services/picker/imagePickerPresets'
import { DocumentInterface } from '@/interfaces/IDocument'
import { DocumentType } from '@/types/document'
import { DocumentStatus } from '@/types/enum'
import { BaseLoadingPage } from '@/components/loadingPage'

// 🔹 TIPOS para documentos obrigatórios do motorista
const REQUIRED_DOCUMENTS: Array<{
  id: DocumentType
  label: string
  description: string
  placeholder: string
  isRequired: boolean
}> = [
  {
    id: 'driver_license',
    label: 'Carta de Condução',
    description: 'Documento oficial de habilitação para conduzir',
    placeholder: 'https://via.placeholder.com/150x100.png?text=Carta+Condução',
    isRequired: true
  },
  {
    id: 'id_front',
    label: 'Bilhete de Identidade (Frente)',
    description: 'Frente do seu documento de identificação',
    placeholder: 'https://via.placeholder.com/150x100.png?text=BI+Frente',
    isRequired: true
  },
  {
    id: 'id_back',
    label: 'Bilhete de Identidade (Verso)',
    description: 'Verso do seu documento de identificação',
    placeholder: 'https://via.placeholder.com/150x100.png?text=BI+Verso',
    isRequired: true
  }
]

export default function DocumentsScreen() {
  // 🔹 STORES & VIEWMODELS
  const { driver } = useAuthStore()
  const { fetchAllDocumentsByField, createDocument, updateDocument } =
    useDocumentsViewModel()

  const { uploadSimple, uploadError } = useFileUploadViewModel()

  const {
    pickImage,
    isUploading: isSelectingImage,
    clearError
  } = useImagePicker()

  // 🔹 ESTADOS
  const [documents, setDocuments] = useState<DocumentInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showAlert } = useAlert()

  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(
    new Set()
  )
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({})
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  // 🔹 EFFECT: Verificar mudanças pendentes
  useEffect(() => {
    const hasChanges = Object.keys(selectedFiles).length > 0
    setHasPendingChanges(hasChanges)
  }, [selectedFiles])

  // 🔹 FUNÇÃO: Fazer upload da imagem
  const handleUploadDocument = async (
    documentType: DocumentType,
    fileUri: string
  ): Promise<string> => {
    try {
      console.log(`📤 Iniciando upload do documento: ${documentType}`)

      const { url, path } = await uploadSimple({
        fileUri,
        folder: `documents/${driver?.id}`
      })

      if (!url || !path) {
        const errorMsg = uploadError?.message || 'Erro ao carregar documento'
        console.error('❌ Upload falhou:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log(`✅ Upload concluído: ${url}`)
      return url
    } catch (err) {
      console.error(`❌ Erro no upload do documento ${documentType}:`, err)
      throw err
    }
  }

  // 🔹 FUNÇÃO: Selecionar imagem
  const handlePickImage = async (documentType: DocumentType) => {
    try {
      clearError()

      const imageUri = await pickImage(
        ImagePickerPresets.DOCUMENT.config,
        ImagePickerPresets.DOCUMENT.validation
      )

      if (imageUri) {
        console.log(`🖼️ Imagem selecionada para ${documentType}:`, imageUri)
        setSelectedFiles(prev => ({
          ...prev,
          [documentType]: imageUri
        }))
      }
    } catch (error: any) {
      console.error('❌ Erro ao selecionar imagem:', error)
      showAlert({
        title: 'Erro',
        message: error.message || 'Não foi possível selecionar a imagem',
        type: 'error'
      })
    }
  }

  // 🔹 FUNÇÃO: Salvar documento individual
  const handleSaveDocument = async (documentType: DocumentType) => {
    if (!driver?.id) {
      showAlert({ title: 'Erro', message: 'ID do motorista não encontrado', type: 'error' })
      return
    }

    const fileUri = selectedFiles[documentType]
    if (!fileUri) {
      showAlert({ title: 'Aviso', message: 'Por favor, selecione uma imagem primeiro', type: 'error' })
      return
    }

    // 🔹 ADICIONAR ao conjunto de uploads em andamento
    setUploadingDocuments(prev => new Set(prev).add(documentType))

    try {
      // 1. Fazer upload da imagem
      const documentUrl = await handleUploadDocument(documentType, fileUri)

      // 2. Buscar documento existente
      const existingDoc = documents?.find(
        doc => doc.type === documentType && doc.user?.id === driver.id
      )

      if (existingDoc) {
        // 3. ATUALIZAR documento existente
        console.log(`📝 Atualizando documento existente: ${documentType}`)
        await updateDocument.mutateAsync({
          id: existingDoc.id,
          document: {
            url: documentUrl,
            status: 'pending' as DocumentStatus,
            updated_at: new Date()
          }
        })
      } else {
        // 4. CRIAR novo documento
        console.log(`📝 Criando novo documento: ${documentType}`)
        await createDocument.mutateAsync({
          user: { id: driver.id } as any,
          type: documentType,
          url: documentUrl,
          status: 'pending' as DocumentStatus,
          label: REQUIRED_DOCUMENTS.find(doc => doc.id === documentType)?.label
        })
      }

      // 5. LIMPAR arquivo selecionado
      setSelectedFiles(prev => {
        const newFiles = { ...prev }
        delete newFiles[documentType]
        return newFiles
      })
      fetchDocuments()

      showAlert({ title: 'Sucesso', message: 'Documento enviado para análise!', type: 'success' })
    } catch (error: any) {
      console.error(`❌ Erro ao salvar documento ${documentType}:`, error)
      showAlert({ title: 'Erro', message: error.message || 'Erro ao salvar documento', type: 'error' })
    } finally {
      // 🔹 REMOVER do conjunto de uploads em andamento
      setUploadingDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentType)
        return newSet
      })
    }
  }

  // 🔹 FUNÇÃO: Enviar todos os documentos para análise
  const handleSubmitAllDocuments = async () => {
    if (!driver?.id) {
      showAlert({ title: 'Erro', message: 'ID do motorista não encontrado', type: 'error' })
      return
    }

    // Verificar se há documentos pendentes de upload
    const pendingUploads = Object.keys(selectedFiles)
    if (pendingUploads.length > 0) {
      showAlert({
        title: 'Documentos Pendentes',
        message: `Você tem ${pendingUploads.length} documento(s) pendentes de upload. Deseja enviá-los primeiro?`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar Agora',
            onPress: () => {
              // Enviar cada documento pendente
              pendingUploads.forEach(async docType => {
                await handleSaveDocument(docType as DocumentType)
              })
            }
          }
        ]
      })
      return
    }

    // Verificar se todos os documentos obrigatórios foram enviados
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.isRequired)
    const uploadedDocs =
      documents?.filter(
        doc =>
          doc.user?.id === driver.id &&
          requiredDocs.some(req => req.id === doc.type)
      ) || []

    if (uploadedDocs.length < requiredDocs.length) {
      const missingCount = requiredDocs.length - uploadedDocs.length
      showAlert({
        title: 'Documentos Faltantes',
        message: `Você precisa enviar ${missingCount} documento(s) obrigatório(s) antes de enviar para análise.`,
        type: 'error'
      })
      return
    }

    showAlert({
      title: 'Enviar para Análise',
      message: 'Todos os documentos serão enviados para análise. Esta ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              // Aqui você pode adicionar lógica adicional se necessário
              showAlert({
                title: 'Sucesso',
                message: 'Documentos enviados para análise com sucesso!',
                type: 'success'
              })
            } catch (error) {
              console.error('❌ Erro ao enviar documentos:', error)
              showAlert({ title: 'Erro', message: 'Erro ao enviar documentos para análise', type: 'error' })
            }
          }
        }
      ]
    })
  }

  // BUSCAR documentos
  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetchAllDocumentsByField('user.id', driver?.id)

      const docs = response?.data || []

      setDocuments(docs)
    } catch (error) {
      console.error('❌ Erro ao buscar documentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (driver?.id) {
      fetchDocuments()
    }
  }, [driver?.id])

  // 🔹 COMPONENTE: Status do documento
  const getStatusUI = (status: DocumentStatus, feedback?: string) => {
    switch (status) {
      case 'approved':
        return (
          <View className="mt-2">
            <View className="flex-row items-center">
              <CheckCircle size={18} color="#10B981" />
              <Text className="ml-1 text-green-600 text-sm font-medium">
                Aprovado
              </Text>
            </View>
          </View>
        )
      case 'rejected':
        return (
          <View className="mt-2">
            <View className="flex-row items-center">
              <XCircle size={18} color="#EF4444" />
              <Text className="ml-1 text-red-600 text-sm font-medium">
                Rejeitado
              </Text>
            </View>
            {feedback && (
              <Text className="text-red-500 text-xs mt-1">{feedback}</Text>
            )}
          </View>
        )
      case 'pending':
        return (
          <View className="flex-row items-center mt-2">
            <Clock size={18} color="#F59E0B" />
            <Text className="ml-1 text-orange-600 text-sm font-medium">
              Em Análise
            </Text>
          </View>
        )
      default:
        return (
          <View className="flex-row items-center mt-2">
            <AlertCircle size={18} color="#6B7280" />
            <Text className="ml-1 text-gray-600 text-sm font-medium">
              Não Enviado
            </Text>
          </View>
        )
    }
  }

  // 🔹 COMPONENTE: Card de documento
  const DocumentCard = ({
    documentConfig
  }: {
    documentConfig: (typeof REQUIRED_DOCUMENTS)[0]
  }) => {
    const driverDocument = documents?.find(
      doc => doc.type === documentConfig.id && doc.user?.id === driver?.id
    )

    const selectedFile = selectedFiles[documentConfig.id]
    const isUploading = uploadingDocuments.has(documentConfig.id)
    const hasFileSelected = !!selectedFile
    const hasDocumentUploaded = !!driverDocument

    return (
      <View className="bg-white rounded-2xl  p-4 mb-4 border border-gray-100">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {documentConfig.label}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {documentConfig.description}
            </Text>
          </View>
          {documentConfig.isRequired && (
            <Text className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
              OBRIGATÓRIO
            </Text>
          )}
        </View>

        {/* Área de Upload */}
        <TouchableOpacity
          onPress={() => {
            if (driverDocument?.status === 'approved') {
              showAlert({
                title: 'Documento já aprovado',
                message: 'Você não pode alterar um documento já aprovado.',
                type: 'error',
                buttons: [{ text: 'Percebi' }]
              })
              return
            }
            handlePickImage(documentConfig.id)
          }}
          disabled={isUploading || isSelectingImage}
          className={`items-center justify-center border-2 border-dashed rounded-xl h-40 bg-gray-50 mt-2 ${
            hasFileSelected ? 'border-green-300 bg-green-50' : 'border-gray-300'
          } ${isUploading || isSelectingImage ? 'opacity-50' : ''}`}
        >
          {isUploading ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#EF4444" />
              <Text className="text-gray-500 text-sm mt-2">Enviando...</Text>
            </View>
          ) : selectedFile ? (
            <Image
              source={{ uri: selectedFile ?? '' }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : driverDocument?.url ? (
            <Image
              source={{ uri: driverDocument.url ?? '' }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Upload size={32} color="#6B7280" />
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Toque para carregar{'\n'}documento
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Status e Ações */}
        <View className="mt-3">
          {/* Status */}
          {getStatusUI(
            driverDocument?.status || 'none',
            driverDocument?.feedback
          )}

          {/* Botão de ação */}
          {hasFileSelected && !isUploading && (
            <TouchableOpacity
              onPress={() => handleSaveDocument(documentConfig.id)}
              className="bg-green-600 py-2 px-4 rounded-lg mt-2 items-center"
            >
              <Text className="text-white font-semibold text-sm">
                Salvar Documento
              </Text>
            </TouchableOpacity>
          )}

          {/* Informação de substituição */}
          {hasDocumentUploaded && hasFileSelected && (
            <Text className="text-orange-600 text-xs mt-1 text-center">
              ⚠️ Este documento será substituído
            </Text>
          )}
        </View>
      </View>
    )
  }

  // 🔹 CALCULAR: Estatísticas dos documentos
  const documentStats = {
    total: REQUIRED_DOCUMENTS.length,
    uploaded: documents?.filter(doc => doc.user?.id === driver?.id).length || 0,
    approved:
      documents?.filter(
        doc => doc.user?.id === driver?.id && doc.status === 'approved'
      ).length || 0,
    pending:
      documents?.filter(
        doc => doc.user?.id === driver?.id && doc.status === 'pending'
      ).length || 0
  }

  if (isLoading) {
    return (
      <BaseLoadingPage
        title="Meus Documentos"
        primaryText={'Carregando documentos...'}
      />
    )
  }
  return (
    <View className="flex-1 bg-gray-50 m-safe">
      {/* Header */}
      <PageHeader title="Meus Documentos" canGoBack={true} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Estatísticas */}
        <View className="bg-white rounded-2xl p-4 mb-4 ">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Status dos Documentos
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {documentStats.uploaded}
              </Text>
              <Text className="text-xs text-gray-500">Enviados</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {documentStats.approved}
              </Text>
              <Text className="text-xs text-gray-500">Aprovados</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {documentStats.pending}
              </Text>
              <Text className="text-xs text-gray-500">Em Análise</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {documentStats.total}
              </Text>
              <Text className="text-xs text-gray-500">Total</Text>
            </View>
          </View>
        </View>

        {/* Lista de Documentos */}
        {REQUIRED_DOCUMENTS.map(documentConfig => (
          <DocumentCard
            key={documentConfig.id}
            documentConfig={documentConfig}
          />
        ))}

        {/* Botão Enviar para Análise */}
        <TouchableOpacity
          onPress={handleSubmitAllDocuments}
          disabled={!hasPendingChanges && documentStats.uploaded === 0}
          className={`py-4 rounded-2xl mt-4 ${
            !hasPendingChanges && documentStats.uploaded === 0
              ? 'bg-gray-300'
              : 'bg-black'
          }`}
        >
          <Text
            className={`text-center font-semibold text-base ${
              !hasPendingChanges && documentStats.uploaded === 0
                ? 'text-gray-500'
                : 'text-white'
            }`}
          >
            {hasPendingChanges ? 'Salvar Alterações' : 'Enviar para Análise'}
          </Text>
        </TouchableOpacity>

        {/* Informações */}
        <View className="mt-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-sm font-medium text-blue-800 mb-2">
            ℹ️ Informações Importantes
          </Text>
          <Text className="text-xs text-blue-600 mb-1">
            • Todos os documentos obrigatórios devem ser enviados
          </Text>
          <Text className="text-xs text-blue-600 mb-1">
            • As imagens devem estar legíveis e nítidas
          </Text>
          <Text className="text-xs text-blue-600">
            • A análise pode levar até 48 horas
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
