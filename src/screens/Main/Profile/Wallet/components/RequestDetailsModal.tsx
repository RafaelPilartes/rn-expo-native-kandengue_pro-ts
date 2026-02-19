// src/screens/Main/Profile/Wallet/components/RequestDetailsModal.tsx
import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native'
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Banknote,
  FileText
} from 'lucide-react-native'
import { WalletTopupRequestInterface } from '@/interfaces/IWalletTopupRequest'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatFullDate } from '@/utils/formatDate'

type RequestDetailsModalProps = {
  visible: boolean
  onClose: () => void
  request: WalletTopupRequestInterface | null
}

export function RequestDetailsModal({
  visible,
  onClose,
  request
}: RequestDetailsModalProps) {
  if (!request) return null

  const getStatusConfig = () => {
    switch (request.status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          color: '#059669', // emerald-600
          bg: '#ECFDF5', // emerald-50
          text: 'Aprovado'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: '#DC2626', // red-600
          bg: '#FEF2F2', // red-50
          text: 'Rejeitado'
        }
      default:
        return {
          icon: Clock,
          color: '#D97706', // amber-600
          bg: '#FFFBEB', // amber-50
          text: 'Pendente'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const DetailRow = ({
    label,
    value,
    icon: Icon,
    isLast = false
  }: {
    label: string
    value: React.ReactNode
    icon: any
    isLast?: boolean
  }) => (
    <View
      className={`flex-row items-start py-4 ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <View className="bg-gray-50 p-2 rounded-full mr-3">
        <Icon size={18} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-medium uppercase mb-1">
          {label}
        </Text>
        {typeof value === 'string' ? (
          <Text className="text-gray-900 font-semibold text-base leading-snug">
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  )

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end py-safe">
        <View className="bg-white rounded-t-[32px] h-[90%] overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Detalhes da Solicitação
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5 font-medium">
                ID: #{request.id.slice(0, 8)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {/* Amount & Status Section */}
            <View className="items-center mb-8">
              <View className="mb-4">
                <Text className="text-4xl font-extrabold text-gray-900 text-center">
                  {formatCurrency(request.amount)}
                </Text>
                <Text className="text-gray-400 text-sm font-medium text-center mt-1">
                  Valor Solicitado
                </Text>
              </View>

              <View
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ backgroundColor: statusConfig.bg }}
              >
                <StatusIcon size={16} color={statusConfig.color} />
                <Text
                  className="ml-2 font-bold text-sm"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.text}
                </Text>
              </View>
            </View>

            {/* Details List */}
            <View className="bg-white rounded-2xl border border-gray-100 px-4 mb-6 ">
              <DetailRow
                label="Data da Solicitação"
                value={
                  request.created_at ? formatFullDate(request.created_at) : '--'
                }
                icon={Calendar}
              />

              <DetailRow
                label="Método de Pagamento"
                value={
                  request.method === 'bank_transfer'
                    ? 'Transferência Bancária'
                    : 'Outro'
                }
                icon={Banknote}
              />

              {request.status === 'rejected' && request.rejected_reason && (
                <DetailRow
                  label="Motivo da Rejeição"
                  value={
                    <Text className="text-red-600 font-medium">
                      {request.rejected_reason}
                    </Text>
                  }
                  icon={AlertCircle}
                  isLast={!request.proof_url}
                />
              )}
            </View>

            {/* Proof Image Section */}
            {request.proof_url && (
              <View>
                <View className="flex-row items-center mb-3">
                  <FileText size={18} color="#6B7280" />
                  <Text className="text-gray-900 font-bold text-base ml-2">
                    Comprovativo
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden p-2">
                  <View className="bg-white rounded-xl overflow-hidden border border-gray-100 aspect-[3/4]">
                    <Image
                      source={{ uri: request.proof_url }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action */}
          <View className="px-6 py-4 border-t border-gray-100 safe-bottom">
            <TouchableOpacity
              onPress={onClose}
              className="w-full bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
            >
              <Text className="text-gray-700 font-bold text-base">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
