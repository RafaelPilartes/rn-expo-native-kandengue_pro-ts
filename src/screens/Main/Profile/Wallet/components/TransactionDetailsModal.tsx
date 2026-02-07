// src/screens/Main/Profile/Wallet/components/TransactionDetailsModal.tsx
import React from 'react'
import { Modal, View, TouchableOpacity, ScrollView, Text } from 'react-native'
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  Tag,
  Wallet,
  Hash
} from 'lucide-react-native'
import { TransactionInterface } from '@/interfaces/ITransaction'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatFullDate } from '@/utils/formatDate'
import { getTransactionCategoryLabel } from '@/utils/gettersLabels'

type TransactionDetailsModalProps = {
  visible: boolean
  onClose: () => void
  transaction: TransactionInterface | null
}

export function TransactionDetailsModal({
  visible,
  onClose,
  transaction
}: TransactionDetailsModalProps) {
  if (!transaction) return null

  const isCredit = transaction.type === 'credit'
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight
  const color = isCredit ? '#059669' : '#DC2626' // emerald-600 : red-600
  const bg = isCredit ? '#ECFDF5' : '#FEF2F2' // emerald-50 : red-50

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
                Detalhes da Transação
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5 font-medium">
                ID: #{transaction.id?.slice(0, 8) || '---'}
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
            {/* Amount & Type Section */}
            <View className="items-center mb-8">
              <View className="mb-4">
                <Text
                  className="text-4xl font-extrabold text-center"
                  style={{ color }}
                >
                  {isCredit ? '+' : '-'}
                  {formatCurrency(transaction.amount || 0)}
                </Text>
                <Text className="text-gray-400 text-sm font-medium text-center mt-1">
                  Valor da Transação
                </Text>
              </View>

              <View
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ backgroundColor: bg }}
              >
                <Icon size={16} color={color} />
                <Text className="ml-2 font-bold text-sm" style={{ color }}>
                  {isCredit ? 'Receita' : 'Despesa'}
                </Text>
              </View>
            </View>

            {/* Details List */}
            <View className="bg-white rounded-2xl border border-gray-100 px-4 mb-6 shadow-sm">
              <DetailRow
                label="Descrição"
                value={transaction.description || 'Sem descrição'}
                icon={FileText}
              />

              <DetailRow
                label="Data"
                value={
                  transaction.created_at
                    ? formatFullDate(transaction.created_at)
                    : '--'
                }
                icon={Calendar}
              />

              {transaction.category && (
                <DetailRow
                  label="Categoria"
                  value={
                    <Text className="text-gray-900 font-semibold text-base capitalize">
                      {getTransactionCategoryLabel(transaction.category)}
                    </Text>
                  }
                  icon={Tag}
                />
              )}

              {(transaction as any).balance_after !== undefined && (
                <DetailRow
                  label="Saldo Após Transação"
                  value={formatCurrency((transaction as any).balance_after)}
                  icon={Wallet}
                />
              )}

              {transaction.reference_id && (
                <DetailRow
                  label="Referência"
                  value={
                    <Text className="text-gray-700 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {transaction.reference_id}
                    </Text>
                  }
                  icon={Hash}
                  isLast={true}
                />
              )}
            </View>
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
