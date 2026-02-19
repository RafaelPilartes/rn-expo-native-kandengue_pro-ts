import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MapPin, Navigation, RefreshCw } from 'lucide-react-native'
import ROUTES from '@/constants/routes'

interface LocationStatusCardProps {
  address: string | null
  isGettingAddress: boolean
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  onOpenMap: () => void
  hasLocation: boolean
}

const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  address,
  isGettingAddress,
  isLoading,
  error,
  onRefresh,
  onOpenMap,
  hasLocation
}) => {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Ícone */}
        <View style={{ marginTop: 4 }}>
          <MapPin size={20} color={address ? '#059669' : '#9CA3AF'} />
        </View>

        {/* Localização */}
        <View style={{ flex: 1 }}>
          {isGettingAddress ? (
            <Text className="text-sm text-gray-500">
              Obtendo localização...
            </Text>
          ) : address ? (
            <Text
              className="text-base font-semibold text-gray-900 mb-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {address}
            </Text>
          ) : (
            <Text className="text-sm text-gray-500">
              Localização não disponível
            </Text>
          )}

          {/* Status da localização */}
          <Text className="text-xs text-gray-500 mt-1">
            {error ? 'Toque para atualizar' : '● GPS Ativo'}
          </Text>
        </View>
      </View>

      {/* Separador */}
      <View style={styles.separator} />

      {/* Botões de ação */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Atualizar localização */}
        <TouchableOpacity
          onPress={onRefresh}
          disabled={isLoading || isGettingAddress}
          style={[styles.actionButton, { flex: 1 }]}
          activeOpacity={0.7}
        >
          <RefreshCw
            size={18}
            color={isLoading || isGettingAddress ? '#9CA3AF' : '#6B7280'}
          />
          <Text className="text-sm font-semibold text-gray-700 ml-2">
            Atualizar
          </Text>
        </TouchableOpacity>

        {/* Ver no mapa */}
        {hasLocation && (
          <TouchableOpacity
            onPress={onOpenMap}
            style={[styles.actionButtonPrimary, { flex: 1 }]}
            activeOpacity={0.7}
          >
            <Navigation size={18} color="#b31a24" />
            <Text className="text-sm font-semibold text-red-800 ml-2">
              Ver Mapa
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Erro de localização */}
      {error && !isGettingAddress && (
        <View style={styles.errorContainer}>
          <Text className="text-xs text-red-500 flex-1">{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={{ marginLeft: 8 }}>
            <Text className="text-xs text-red-600 font-semibold">
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 12
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  errorContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default LocationStatusCard
