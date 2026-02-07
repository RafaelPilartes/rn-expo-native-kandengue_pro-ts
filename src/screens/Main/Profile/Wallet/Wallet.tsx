// src/screens/Main/Profile/Wallet/Wallet.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import {
  PlusCircle,
  Wallet,
  BarChart3,
  CreditCard,
  History,
  Link2Off
} from 'lucide-react-native'

// Components
import PageHeader from '@/components/PageHeader'
import { TransactionCard } from '@/components/wallet/TransactionCard'
import { TopupRequestCard } from '@/components/wallet/TopupRequestCard'
import { TopupRequestModal } from './components/TopupRequestModal'
import { StatisticsModal } from './components/StatisticsModal'
import { RequestDetailsModal } from './components/RequestDetailsModal'
import { TransactionDetailsModal } from './components/TransactionDetailsModal'

// ViewModels
import { useImagePicker } from '@/hooks/useImagePicker'
import { useFileUploadViewModel } from '@/viewModels/FileUploadViewModel'
import { ImagePickerPresets } from '@/services/picker/imagePickerPresets'

// Types
import { TransactionInterface } from '@/interfaces/ITransaction'
import { WalletTopupRequestInterface } from '@/interfaces/IWalletTopupRequest'
import { useWalletsViewModel } from '@/viewModels/WalletViewModel'
import { useTransactionsViewModel } from '@/viewModels/TransactionViewModel'
import { useAppProvider } from '@/providers/AppProvider'
import { useWalletTopupRequestsViewModel } from '@/viewModels/WalletTopupRequestViewModel'
import { formatMoney } from '@/utils/formattedNumber'
import { useAuthStore } from '@/storage/store/useAuthStore'

const PRIMARY_COLOR = '#b31a24'

type ActiveTab = 'transactions' | 'requests'

export default function WalletScreen() {
  const { driver } = useAuthStore()
  const { wallet } = useAppProvider()

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions')
  const [modalVisible, setModalVisible] = useState(false)
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [transactionDetailsModalVisible, setTransactionDetailsModalVisible] =
    useState(false)

  const [selectedRequest, setSelectedRequest] =
    useState<WalletTopupRequestInterface | null>(null)
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionInterface | null>(null)

  const [amount, setAmount] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [transactions, setTransactions] = useState<TransactionInterface[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [walletTopupRequests, setWalletTopupRequests] = useState<
    WalletTopupRequestInterface[]
  >([])
  const [isLoadingWalletTopupRequests, setIsLoadingWalletTopupRequests] =
    useState(true)

  // ViewModels
  const { createWalletTopupRequest, fetchAllWalletTopupRequestsByField } =
    useWalletTopupRequestsViewModel()
  const { fetchAllTransactionsByField } = useTransactionsViewModel()

  const { pickImage, isUploading: isSelectingImage } = useImagePicker()
  const {
    uploadSomeImageForUser,
    isUploadingSomeImageForUser: isUploadingFile
  } = useFileUploadViewModel()

  // 🔹 Carregar transações da carteira
  const loadTransactions = async () => {
    if (!wallet?.id) {
      setIsLoadingTransactions(false)
      return
    }

    setIsLoadingTransactions(true)
    try {
      const transactionsResponse = await fetchAllTransactionsByField(
        'wallet_id',
        wallet.id,
        100
      )
      setTransactions(transactionsResponse?.data || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      Alert.alert('Erro', 'Não foi possível carregar as transações')
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  // 🔹 Carregar solicitações
  const loadTopupRequests = async () => {
    if (!wallet?.id) return

    setIsLoadingWalletTopupRequests(true)
    try {
      const topupRequestsResponse = await fetchAllWalletTopupRequestsByField(
        'wallet_id',
        wallet.id,
        100
      )
      setWalletTopupRequests(topupRequestsResponse?.data || [])
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      Alert.alert('Erro', 'Não foi possível carregar as solicitações')
    } finally {
      setIsLoadingWalletTopupRequests(false)
    }
  }

  // 🔹 Carregar dados iniciais
  useEffect(() => {
    if (wallet?.id) {
      loadTransactions()
      loadTopupRequests()
    } else {
      setIsLoadingTransactions(false)
      setIsLoadingWalletTopupRequests(false)
    }
  }, [wallet?.id])

  // 🔹 Atualizar dados ao puxar para refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        wallet?.id ? loadTransactions() : Promise.resolve(),
        wallet?.id ? loadTopupRequests() : Promise.resolve()
      ])
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // 🔹 Selecionar imagem do comprovativo
  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage(
        ImagePickerPresets.DOCUMENT.config,
        ImagePickerPresets.DOCUMENT.validation
      )

      if (imageUri) {
        setSelectedImage(imageUri)
      }
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível selecionar a imagem'
      )
    }
  }

  // 🔹 Limpar imagem selecionada
  const handleClearImage = () => {
    setSelectedImage(null)
  }

  // 🔹 Validar formulário de carregamento
  const validateForm = (): boolean => {
    if (!amount.trim()) {
      Alert.alert('Erro', 'Por favor, insira o valor do carregamento')
      return false
    }

    const amountValue = Number(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido')
      return false
    }

    if (amountValue < 500) {
      Alert.alert('Erro', 'O valor mínimo de carregamento é 500 AOA')
      return false
    }

    if (!selectedImage) {
      Alert.alert('Erro', 'Por favor, carregue o comprovativo de pagamento')
      return false
    }

    return true
  }

  // 🔹 Submeter solicitação de carregamento
  const handleSubmitRequest = async () => {
    if (!validateForm()) return
    if (!wallet?.id) {
      Alert.alert('Erro', 'Carteira não encontrada')
      return
    }

    try {
      // Fazer upload do comprovativo
      const uploadResult = await uploadSomeImageForUser({
        fileUri: selectedImage!,
        userId: driver?.id as string,
        imageType: 'topup-proofs'
      })

      if (!uploadResult.url) {
        throw new Error('Falha no upload do comprovativo')
      }

      // Criar solicitação de carregamento
      await createWalletTopupRequest.mutateAsync({
        wallet_id: wallet.id,
        amount: Number(amount),
        proof_url: uploadResult.url,
        status: 'pending',
        method: 'bank_transfer'
      })

      // Limpar formulário
      setAmount('')
      setSelectedImage(null)
      setModalVisible(false)

      // Recarregar solicitações
      await loadTopupRequests()

      Alert.alert(
        'Sucesso',
        'Solicitação de carregamento enviada com sucesso!',
        [{ text: 'OK' }]
      )
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error)
      Alert.alert('Erro', error.message || 'Erro ao enviar solicitação')
    }
  }

  // 🔹 Abrir detalhes da solicitação
  const handleOpenRequestDetails = (request: WalletTopupRequestInterface) => {
    setSelectedRequest(request)
    setDetailsModalVisible(true)
  }

  // 🔹 Abrir detalhes da transação
  const handleOpenTransactionDetails = (transaction: TransactionInterface) => {
    setSelectedTransaction(transaction)
    setTransactionDetailsModalVisible(true)
  }

  // 🔹 Calcular estatísticas
  const calculateStatistics = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'credit' && t.category === 'ride_fee')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const totalExpense = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const pendingRequests = walletTopupRequests.filter(
      r => r.status === 'pending'
    ).length
    const approvedRequests = walletTopupRequests.filter(
      r => r.status === 'approved'
    ).length

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      pendingRequests,
      approvedRequests,
      totalTransactions: transactions.length
    }
  }

  const statistics = calculateStatistics()

  // 🔹 Renderizar item da lista de transações
  const renderTransaction = ({ item }: { item: TransactionInterface }) => (
    <TransactionCard
      transaction={item}
      onPress={() => handleOpenTransactionDetails(item)}
    />
  )

  // 🔹 Renderizar item da lista de solicitações
  const renderRequest = ({ item }: { item: WalletTopupRequestInterface }) => (
    <TopupRequestCard
      request={item}
      onPress={() => handleOpenRequestDetails(item)}
    />
  )

  // Loading states combinados
  const isSubmitting = createWalletTopupRequest.isPending || isUploadingFile

  // 🔹 Renderizar conteúdo baseado na tab ativa
  const renderContent = () => {
    if (activeTab === 'transactions') {
      if (isLoadingTransactions) {
        return (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text className="text-gray-600 mt-4">Carregando transações...</Text>
          </View>
        )
      }

      if (!wallet?.id) {
        return (
          <View className="items-center justify-center py-16 px-4">
            <Link2Off size={64} color="#D1D5DB" />
            <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
              Ainda nenhuma carteira cadastrada
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Por favor, aguarde ou entre em contato com o suporte
            </Text>
          </View>
        )
      }

      return (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id as string}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-4">
              <CreditCard size={64} color="#D1D5DB" />
              <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
                Nenhuma transação encontrada
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Suas transações aparecerão aqui
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1
          }}
        />
      )
    }

    // Tab de solicitações
    if (isLoadingWalletTopupRequests) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text className="text-gray-600 mt-4">Carregando solicitações...</Text>
        </View>
      )
    }

    if (!wallet?.id) {
      return (
        <View className="items-center justify-center py-16 px-4">
          <Link2Off size={64} color="#D1D5DB" />
          <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
            Ainda nenhuma carteira cadastrada
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Por favor, aguarde ou entre em contato com o suporte
          </Text>
        </View>
      )
    }

    return (
      <FlatList
        data={walletTopupRequests}
        renderItem={renderRequest}
        keyExtractor={item => item.id as string}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <History size={64} color="#D1D5DB" />
            <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
              Nenhuma solicitação encontrada
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Suas solicitações de carregamento aparecerão aqui
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1
        }}
      />
    )
  }

  return (
    <View className="flex-1 bg-gray-50 py-safe">
      {/* Header */}
      <PageHeader title="Minha Carteira" canGoBack={true} />

      {/* Saldo Atual */}
      <View className="items-center py-8 bg-white mb-4 shadow-sm mx-4 mt-4 rounded-3xl">
        <View className="bg-red-50 p-4 rounded-full mb-3">
          <Wallet size={40} color={PRIMARY_COLOR} />
        </View>
        <Text className="text-gray-500 text-sm font-medium">Saldo Atual</Text>
        <Text className="text-4xl font-bold text-gray-900 mt-2">
          AOA {formatMoney(wallet?.balance || 0)}
        </Text>

        {wallet?.id && (
          <View className="flex-row items-center justify-center mt-6 gap-3 px-4">
            {/* Botão Carregar Saldo */}
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              disabled={isLoadingWalletTopupRequests}
              className="bg-primary-400 px-6 py-4 rounded-full flex-row items-center flex-1"
              style={{
                shadowColor: PRIMARY_COLOR,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <PlusCircle size={20} color="white" />
              <Text className="ml-2 text-white font-bold text-base">
                Carregar Saldo
              </Text>
            </TouchableOpacity>

            {/* Botão Estatísticas */}
            <TouchableOpacity
              onPress={() => setStatisticsModalVisible(true)}
              className="px-5 py-4 border-2 border-primary-400 rounded-full flex-row items-center"
            >
              <BarChart3 size={20} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white rounded-3xl mx-4 mb-4 p-1.5 shadow-sm border border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab('transactions')}
          className={`flex-1 py-4 rounded-3xl flex-row items-center justify-center ${
            activeTab === 'transactions' ? 'bg-primary-400' : ''
          }`}
          style={
            activeTab === 'transactions'
              ? {
                  shadowColor: PRIMARY_COLOR,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2
                }
              : undefined
          }
        >
          <CreditCard
            size={18}
            color={activeTab === 'transactions' ? 'white' : '#6B7280'}
          />
          <Text
            className={`ml-2 font-bold text-sm ${
              activeTab === 'transactions' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Transações ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-4 rounded-3xl flex-row items-center justify-center ${
            activeTab === 'requests' ? 'bg-primary-400' : ''
          }`}
          style={
            activeTab === 'requests'
              ? {
                  shadowColor: PRIMARY_COLOR,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2
                }
              : undefined
          }
        >
          <History
            size={18}
            color={activeTab === 'requests' ? 'white' : '#6B7280'}
          />
          <Text
            className={`ml-2 font-bold text-sm ${
              activeTab === 'requests' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Solicitações ({walletTopupRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Lista */}
      {renderContent()}

      {/* Modals */}
      <TopupRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        amount={amount}
        onAmountChange={setAmount}
        selectedImage={selectedImage}
        onPickImage={handlePickImage}
        onClearImage={handleClearImage}
        onSubmit={handleSubmitRequest}
        isSubmitting={isSubmitting}
        isSelectingImage={isSelectingImage}
      />

      <StatisticsModal
        visible={statisticsModalVisible}
        onClose={() => setStatisticsModalVisible(false)}
        statistics={statistics}
        currentBalance={wallet?.balance || 0}
      />

      <RequestDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        request={selectedRequest}
      />

      <TransactionDetailsModal
        visible={transactionDetailsModalVisible}
        onClose={() => setTransactionDetailsModalVisible(false)}
        transaction={selectedTransaction}
      />
    </View>
  )
}
