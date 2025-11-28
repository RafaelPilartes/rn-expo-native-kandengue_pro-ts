// src/components/wallet/TransactionCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TransactionInterface } from '@/interfaces/ITransaction';
import { formatMoney } from '@/utils/formattedNumber';
import {
  getTransactionIcon,
  getTransactionColor,
} from '@/utils/transactionUtils';
import { formatFullDate } from '@/utils/formatDate';

interface TransactionCardProps {
  transaction: TransactionInterface;
  onPress?: (transaction: TransactionInterface) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const IconComponent = getTransactionIcon(
    transaction.type,
    transaction.category,
  );
  const color = getTransactionColor(transaction.type);

  const handlePress = () => {
    onPress?.(transaction);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white"
    >
      {/* Ícone */}
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${color.bg}`}
      >
        <IconComponent size={20} color={color.icon} />
      </View>

      {/* Informações */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {getTransactionTitle(transaction)}
        </Text>
        <Text className="text-sm text-gray-600">{transaction.description}</Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatFullDate(transaction.created_at)}
        </Text>
      </View>

      {/* Valor */}
      <View className="items-end">
        <Text className={`text-base font-bold ${color.text}`}>
          {transaction.amount >= 0 ? '+' : ''}
          {formatMoney(transaction.amount, 0)}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {getTransactionStatus(transaction)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Utilitários para transações
const getTransactionTitle = (transaction: TransactionInterface): string => {
  const titles = {
    wallet_topup: 'Carregamento de Saldo',
    ride_fee: 'Taxa de Corrida',
    pension: 'Pensão',
    bonus: 'Bónus',
    refund: 'Reembolso',
  };
  return titles[transaction.category] || 'Transação';
};

const getTransactionStatus = (transaction: TransactionInterface): string => {
  return 'Concluído'; // Você pode adicionar status mais complexos se necessário
};
