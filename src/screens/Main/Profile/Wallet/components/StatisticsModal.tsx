// src/screens/Main/Profile/Wallet/components/StatisticsModal.tsx
import React from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Activity,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react-native'
import { formatCurrency } from '@/utils/formatCurrency'

type StatisticsModalProps = {
  visible: boolean
  onClose: () => void
  statistics: {
    totalIncome: number
    totalExpense: number
    netBalance: number
    pendingRequests: number
    approvedRequests: number
    totalTransactions: number
  }
  currentBalance: number
}

export function StatisticsModal({
  visible,
  onClose,
  statistics,
  currentBalance
}: StatisticsModalProps) {
  const isPositive = statistics.netBalance >= 0
  const netColor = isPositive ? '#059669' : '#DC2626'
  const netBg = isPositive ? '#ECFDF5' : '#FEF2F2'
  const NetIcon = isPositive ? TrendingUp : ArrowDownLeft // Just a visual indicator

  const DetailRow = ({
    label,
    value,
    icon: Icon,
    isLast = false,
    valueColor = 'text-gray-900'
  }: {
    label: string
    value: React.ReactNode
    icon: any
    isLast?: boolean
    valueColor?: string
  }) => (
    <View
      className={`flex-row items-center py-4 ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <View className="bg-gray-50 p-2 rounded-full mr-3">
        <Icon size={18} color="#6B7280" />
      </View>
      <View className="flex-1 flex-row justify-between items-center">
        <Text className="text-gray-500 text-xs font-medium uppercase">
          {label}
        </Text>
        {typeof value === 'string' ? (
          <Text className={`font-bold text-base ${valueColor}`}>{value}</Text>
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
                Estatísticas
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5 font-medium">
                Resumo financeiro
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
            {/* Net Balance Hero */}
            <View className="items-center mb-8">
              <View className="mb-4">
                <Text
                  className="text-4xl font-extrabold text-center"
                  style={{ color: netColor }}
                >
                  {formatCurrency(statistics.netBalance)}
                </Text>
                <Text className="text-gray-400 text-sm font-medium text-center mt-1">
                  Saldo Líquido
                </Text>
              </View>

              <View
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ backgroundColor: netBg }}
              >
                <NetIcon size={16} color={netColor} />
                <Text
                  className="ml-2 font-bold text-sm"
                  style={{ color: netColor }}
                >
                  {isPositive ? 'Positivo' : 'Negativo'}
                </Text>
              </View>
            </View>

            {/* Income / Expense Grid */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <View className="bg-emerald-100 w-8 h-8 rounded-full items-center justify-center mb-3">
                  <ArrowDownLeft size={16} color="#059669" />
                </View>
                <Text className="text-emerald-800 text-[10px] font-bold uppercase mb-1">
                  Receitas
                </Text>
                <Text className="text-emerald-900 text-lg font-bold">
                  {formatCurrency(statistics.totalIncome)}
                </Text>
              </View>

              <View className="flex-1 bg-red-50 p-4 rounded-2xl border border-red-100">
                <View className="bg-red-100 w-8 h-8 rounded-full items-center justify-center mb-3">
                  <ArrowUpRight size={16} color="#DC2626" />
                </View>
                <Text className="text-red-800 text-[10px] font-bold uppercase mb-1">
                  Despesas
                </Text>
                <Text className="text-red-900 text-lg font-bold">
                  {formatCurrency(statistics.totalExpense)}
                </Text>
              </View>
            </View>

            {/* General Stats List */}
            <View className="bg-white rounded-2xl border border-gray-100 px-4 ">
              <DetailRow
                label="Saldo Atual Disponível"
                value={formatCurrency(currentBalance)}
                icon={Wallet}
                valueColor="text-blue-600"
              />

              <DetailRow
                label="Total de Transações"
                value={statistics.totalTransactions.toString()}
                icon={Activity}
              />

              <DetailRow
                label="Solicitações Pendentes"
                value={
                  <View className="flex-row items-center">
                    {statistics.pendingRequests > 0 && (
                      <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                    )}
                    <Text className="font-bold text-base text-gray-900">
                      {statistics.pendingRequests}
                    </Text>
                  </View>
                }
                icon={Clock}
              />

              <DetailRow
                label="Solicitações Aprovadas"
                value={statistics.approvedRequests.toString()}
                icon={CheckCircle2}
                isLast={true}
              />
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
