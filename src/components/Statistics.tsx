// src/components/Statistics.tsx
import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { Wallet, Package, TrendingUp } from 'lucide-react-native'
import { formatMoney } from '@/utils/formattedNumber'

interface StatisticsProps {
  balance: number
  totalRides: number
  isLoading?: boolean
}

const Statistics: React.FC<StatisticsProps> = ({
  balance,
  totalRides,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={[
              styles.statCard,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 100
              }
            ]}
          >
            <ActivityIndicator size="small" color="#b31a24" />
          </View>
          <View
            style={[
              styles.statCard,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 100
              }
            ]}
          >
            <ActivityIndicator size="small" color="#b31a24" />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Saldo Card */}
        <View style={[styles.statCard, { flex: 1 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}
          >
            <Wallet size={20} color="#b31a24" />
            <TrendingUp size={16} color="#059669" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {formatMoney(balance, 0)}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Saldo Disponível</Text>
        </View>

        {/* Corridas Card */}
        <View style={[styles.statCard, { flex: 1 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}
          >
            <Package size={20} color="#2563EB" />
            <Text className="text-xs text-gray-400">hoje</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{totalRides}</Text>
          <Text className="text-xs text-gray-500 mt-1">Entregas</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#2424244b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  }
})

export default Statistics
