// src/screens/Driver/WalletScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  PlusCircle,
  Wallet,
  X,
  BarChart3,
  CreditCard,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react-native'

// Components
import PageHeader from '@/components/PageHeader'
import { TransactionCard } from '@/components/wallet/TransactionCard'
import { TopupRequestCard } from '@/components/wallet/TopupRequestCard'
import { ImagePickerButton } from '@/components/wallet/ImagePickerButton'

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
import { formatCurrency } from '@/utils/formatCurrency'
import { formatMoney } from '@/utils/formattedNumber'
import { formatFullDate } from '@/utils/formatDate'
import { useAuthStore } from '@/storage/store/useAuthStore'

type ActiveTab = 'transactions' | 'requests'

export default function WalletScreen() {
  const { driver } = useAuthStore()
  const { wallet } = useAppProvider()

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions')
  const [modalVisible, setModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false)
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
    if (!wallet?.id) return

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
      .filter(t => t.type === 'credit')
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
  const canSubmit = amount.trim() && selectedImage && !isSubmitting

  // 🔹 Renderizar conteúdo baseado na tab ativa
  const renderContent = () => {
    if (activeTab === 'transactions') {
      if (isLoadingTransactions) {
        return (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-gray-600 mt-4">Carregando transações...</Text>
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
              colors={['#EF4444']}
              tintColor="#EF4444"
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
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-600 mt-4">Carregando solicitações...</Text>
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
            colors={['#EF4444']}
            tintColor="#EF4444"
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
    <View className="flex-1 bg-gray-50 m-safe">
      {/* Header */}
      <PageHeader title="Minha Carteira" canGoBack={true} />

      {/* Saldo Atual */}
      <View className="items-center py-8 bg-white mb-4 shadow-sm">
        <Wallet size={40} color="#EF4444" />
        <Text className="text-gray-500 mt-2">Saldo Atual</Text>
        <Text className="text-3xl font-bold text-black mt-1">
          AOA {formatMoney(wallet?.balance || 0)}
        </Text>

        <View className="flex-row items-center justify-center mt-6 gap-3">
          {/* Botão Carregar Saldo */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            disabled={isLoadingWalletTopupRequests}
            className="bg-primary-200 px-5 py-3 rounded-full flex-row items-center"
          >
            <PlusCircle size={20} color="white" />
            <Text className="ml-2 text-white font-semibold text-base">
              Carregar Saldo
            </Text>
          </TouchableOpacity>

          {/* Botão Estatísticas */}
          <TouchableOpacity
            onPress={() => setStatisticsModalVisible(true)}
            className="px-4 py-3 border border-primary-200 rounded-full flex-row items-center"
          >
            <BarChart3 size={18} color="#EF4444" />
            <Text className="ml-2 text-primary-200 font-semibold">
              Estatísticas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white rounded-2xl mx-4 mb-4 p-1 shadow-sm">
        <TouchableOpacity
          onPress={() => setActiveTab('transactions')}
          className={`flex-1 py-3 rounded-2xl flex-row items-center justify-center ${
            activeTab === 'transactions' ? 'bg-primary-200' : ''
          }`}
        >
          <CreditCard
            size={18}
            color={activeTab === 'transactions' ? 'white' : '#6B7280'}
          />
          <Text
            className={`ml-2 font-semibold ${
              activeTab === 'transactions' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Transações ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-3 rounded-2xl flex-row items-center justify-center ${
            activeTab === 'requests' ? 'bg-primary-200' : ''
          }`}
        >
          <History
            size={18}
            color={activeTab === 'requests' ? 'white' : '#6B7280'}
          />
          <Text
            className={`ml-2 font-semibold ${
              activeTab === 'requests' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Solicitações ({walletTopupRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Lista */}
      {renderContent()}

      {/* Modal de Carregamento */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white p-6 rounded-t-3xl max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Carregar Saldo
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <X size={24} color={isSubmitting ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Valor */}
            <Text className="text-gray-600 mb-2 font-medium">
              Valor a carregar (Kz)
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 5000"
              keyboardType="numeric"
              editable={!isSubmitting}
              className="text-black border border-gray-300 rounded-xl px-4 py-4 text-lg font-semibold mb-6"
              placeholderTextColor="#9CA3AF"
            />

            {/* Comprovativo */}
            <Text className="text-gray-600 mb-3 font-medium">
              Comprovativo de Transferência
            </Text>
            <ImagePickerButton
              imageUri={selectedImage}
              onPickImage={handlePickImage}
              onClearImage={handleClearImage}
              isLoading={isSelectingImage}
              label="Carregar comprovativo"
            />

            {/* Botão Enviar */}
            <TouchableOpacity
              onPress={handleSubmitRequest}
              disabled={!canSubmit}
              className={`py-4 rounded-xl mt-6 ${
                !canSubmit ? 'bg-gray-300' : 'bg-red-500'
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center mt-4">
              O saldo será creditado após aprovação do comprovativo
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de Estatísticas */}
      <Modal visible={statisticsModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white p-6 rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Estatísticas da Carteira
              </Text>
              <TouchableOpacity
                onPress={() => setStatisticsModalVisible(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                {/* Saldo Atual */}
                <View className="bg-blue-50 p-4 rounded-xl">
                  <Text className="text-blue-800 text-sm font-medium">
                    Saldo Atual
                  </Text>
                  <Text className="text-2xl font-bold text-blue-900">
                    AOA {formatMoney(wallet?.balance || 0)}
                  </Text>
                </View>

                {/* Receitas e Despesas */}
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <ArrowDownLeft size={16} color="#059669" />
                      <Text className="text-green-800 text-sm font-medium ml-1">
                        Receitas
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-green-900 mt-1">
                      AOA {formatMoney(statistics.totalIncome)}
                    </Text>
                  </View>

                  <View className="flex-1 bg-red-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <ArrowUpRight size={16} color="#DC2626" />
                      <Text className="text-red-800 text-sm font-medium ml-1">
                        Despesas
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-red-900 mt-1">
                      AOA {formatMoney(statistics.totalExpense)}
                    </Text>
                  </View>
                </View>

                {/* Saldo Líquido */}
                <View
                  className={`p-4 rounded-xl ${
                    statistics.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <Text className="text-sm font-medium">Saldo Líquido</Text>
                  <Text
                    className={`text-xl font-bold ${
                      statistics.netBalance >= 0
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}
                  >
                    AOA {formatMoney(statistics.netBalance)}
                  </Text>
                </View>

                {/* Resumo de Transações */}
                <View className="bg-gray-50 p-4 rounded-xl">
                  <Text className="text-gray-800 font-medium mb-2">Resumo</Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Total de Transações</Text>
                      <Text className="font-semibold">
                        {statistics.totalTransactions}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">
                        Solicitações Pendentes
                      </Text>
                      <Text className="font-semibold text-yellow-600">
                        {statistics.pendingRequests}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">
                        Solicitações Aprovadas
                      </Text>
                      <Text className="font-semibold text-green-600">
                        {statistics.approvedRequests}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes da Solicitação */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white p-6 rounded-t-3xl max-h-[80%]">
            {selectedRequest && (
              <>
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-gray-800">
                    Detalhes da Solicitação
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="gap-4">
                    <View>
                      <Text className="text-gray-600 text-sm">Valor</Text>
                      <Text className="text-xl font-bold text-gray-800">
                        {formatCurrency(selectedRequest.amount)}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-gray-600 text-sm">Data</Text>
                      <Text className="text-gray-800">
                        {selectedRequest.created_at
                          ? new Date(
                              selectedRequest.created_at
                            ).toLocaleDateString('pt-BR')
                          : '--'}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-gray-600 text-sm">Status</Text>
                      <Text
                        className={`font-semibold text-lg ${
                          selectedRequest.status === 'approved'
                            ? 'text-green-600'
                            : selectedRequest.status === 'rejected'
                              ? 'text-red-500'
                              : 'text-yellow-600'
                        }`}
                      >
                        {selectedRequest.status === 'approved'
                          ? 'Aprovado'
                          : selectedRequest.status === 'rejected'
                            ? 'Rejeitado'
                            : 'Pendente'}
                      </Text>
                    </View>

                    {selectedRequest.rejected_reason && (
                      <View>
                        <Text className="text-gray-600 text-sm">
                          Motivo da Rejeição
                        </Text>
                        <Text className="text-red-600">
                          {selectedRequest.rejected_reason}
                        </Text>
                      </View>
                    )}

                    {selectedRequest.proof_url && (
                      <View>
                        <Text className="text-gray-600 text-sm mb-2">
                          Comprovativo
                        </Text>
                        <Image
                          source={{ uri: selectedRequest.proof_url }}
                          className="w-full h-40 rounded-lg"
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes da Transação */}
      <Modal
        visible={transactionDetailsModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-black/40 justify-end m-safe">
          <View className="bg-white p-6 rounded-t-3xl max-h-[80%]">
            {selectedTransaction && (
              <>
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-gray-800">
                    Detalhes da Transação
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTransactionDetailsModalVisible(false)}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View className="gap-4">
                  <View>
                    <Text className="text-gray-600 text-sm">Descrição</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      {selectedTransaction.description || 'Transação'}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-600 text-sm">Valor</Text>
                      <Text
                        className={`text-xl font-bold ${
                          selectedTransaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-primary-200'
                        }`}
                      >
                        {selectedTransaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(selectedTransaction.amount)}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-gray-600 text-sm">Tipo</Text>
                      <Text className="text-gray-800 font-semibold capitalize">
                        {selectedTransaction.type === 'credit'
                          ? 'Crédito'
                          : 'Débito'}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-600 text-sm">Categoria</Text>
                    <Text className="text-gray-800 font-medium capitalize">
                      {selectedTransaction.category === 'wallet_topup'
                        ? 'Carregamento de Saldo'
                        : selectedTransaction.category === 'ride_fee'
                          ? 'Taxa de Corrida'
                          : selectedTransaction.category === 'pension'
                            ? 'Pensão'
                            : selectedTransaction.category === 'bonus'
                              ? 'Bónus'
                              : 'Reembolso'}
                    </Text>
                  </View>

                  {selectedTransaction.reference_id && (
                    <View>
                      <Text className="text-gray-600 text-sm">Referência</Text>
                      <Text className="text-gray-800 font-medium">
                        #{selectedTransaction.reference_id}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text className="text-gray-600 text-sm">Data</Text>
                    <Text className="text-gray-800 font-medium">
                      {selectedTransaction.created_at
                        ? formatFullDate(
                            selectedTransaction.created_at,
                            'dd/MM/yyyy HH:mm'
                          )
                        : '--'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}
