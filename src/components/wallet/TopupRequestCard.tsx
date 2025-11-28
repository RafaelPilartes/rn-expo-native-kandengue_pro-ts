// src/components/wallet/TopupRequestCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { WalletTopupRequestInterface } from '@/interfaces/IWalletTopupRequest';
import { formatMoney } from '@/utils/formattedNumber';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { formatFullDate } from '@/utils/formatDate';

interface TopupRequestCardProps {
  request: WalletTopupRequestInterface;
  onPress: (request: WalletTopupRequestInterface) => void;
}

export const TopupRequestCard: React.FC<TopupRequestCardProps> = ({
  request,
  onPress,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Aprovado',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Rejeitado',
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Pendente',
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      onPress={() => onPress(request)}
      className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-sm font-semibold text-gray-800 mr-2">
            Solicitação #{request.id.slice(-6)}
          </Text>
          <View className={`px-2 py-1 rounded-full ${statusConfig.bg}`}>
            <Text className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text className="text-xs text-gray-500">
          {formatFullDate(request.created_at)}
        </Text>
        <Text className="text-xs text-gray-500">
          Método: {getMethodLabel(request.method)}
        </Text>

        {request.rejected_reason && (
          <Text className="text-xs text-red-600 mt-1">
            Motivo: {request.rejected_reason}
          </Text>
        )}
      </View>

      <View className="items-end">
        <Text className="text-base font-bold text-black">
          AOA {formatMoney(request.amount, 0)}
        </Text>
        <View className="flex-row items-center mt-1">
          <StatusIcon
            size={14}
            color={statusConfig.color.replace('text-', '')}
          />
          <Text className={`text-xs ml-1 ${statusConfig.color}`}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getMethodLabel = (method: string): string => {
  const methods = {
    bank_transfer: 'Transferência Bancária',
    automated: 'Automático',
    cash: 'Dinheiro',
  };
  return methods[method as keyof typeof methods] || method;
};
