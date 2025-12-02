// src/components/RideList.tsx
import React from 'react'
import { View, Text, FlatList, Image } from 'react-native'
import { AlertCircle, BanknoteX, Car, Currency } from 'lucide-react-native'
import { DriverInterface } from '@/interfaces/IDriver'
import { RideInterface } from '@/interfaces/IRide'
import { WalletInterface } from '@/interfaces/IWallet'
import RideCard from './RideCard'
import { MIN_AMOUNT } from '@/constants/config'
import { VehicleInterface } from '@/interfaces/IVehicle'

interface RideListProps {
  driver: DriverInterface | null
  rides: RideInterface[] | undefined
  onToDocuments: () => void
  onDetailsRide: (ride: RideInterface) => void
  vehicle: VehicleInterface | null
  wallet: WalletInterface | null
}

const RideList: React.FC<RideListProps> = ({
  driver,
  rides,
  onToDocuments,
  onDetailsRide,
  vehicle,
  wallet
}) => {
  // 🔹 Estado quando driver está offline
  if (!driver?.is_online && driver?.status === 'active') {
    return (
      <View className="flex-1 items-center justify-center px-5">
        <Car size={64} color="gray" />
        <Text className="text-center text-gray-500 mt-4">
          Você está offline. Ative o modo online para receber solicitações de
          corridas.
        </Text>
      </View>
    )
  }

  // 🔹 Estado quando conta não está ativa
  if (driver?.is_online && driver?.status !== 'active') {
    return (
      <View className="flex-1 items-center justify-center px-5">
        <AlertCircle size={64} color="gray" />
        <Text className="text-center text-gray-500 mt-4">
          A sua conta precisa estar ativa para receber solicitações de corridas.
        </Text>
        <Text
          className="text-center text-blue-500 mt-2 underline"
          onPress={onToDocuments}
        >
          Verificar documentos
        </Text>
      </View>
    )
  }

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center px-5">
        <Car size={64} color="gray" />
        <Text className="text-center text-gray-500 mt-4">
          Precisa ter um veículo cadastrado e valido para aceitar corridas.
        </Text>
      </View>
    )
  }
  // 🔹 Estado quando online e ativo, mas sem corridas
  if (driver?.is_online && driver?.status === 'active') {
    return (
      <View className="flex-1 px-5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-gray-800">
            Solicitações ({rides?.length})
          </Text>
        </View>

        {/* Aqui você pode renderizar a lista de corridas */}
        {rides ? (
          <>
            {wallet && wallet.balance < MIN_AMOUNT ? (
              <>
                <View className="flex-1 items-center justify-center px-5">
                  <BanknoteX size={64} color="gray" />
                  <Text className="text-center text-gray-500 mt-4">
                    Saldo insuficiente para aceitar corridas. Carregue sua
                    carteira.
                  </Text>
                </View>
              </>
            ) : (
              <FlatList
                data={rides}
                keyExtractor={item => item.id as string}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <RideCard
                    ride={item}
                    onPressDetails={() => onDetailsRide(item)}
                  />
                )}
                ItemSeparatorComponent={() => <View className="h-3" />}
              />
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Car size={64} color="gray" />
            <Text className="text-center text-gray-500 mt-4">
              Nenhuma corrida disponível no momento.
            </Text>
            <Text className="text-center text-gray-400 text-sm mt-2">
              Novas corridas aparecerão aqui automaticamente
            </Text>
          </View>
        )}
      </View>
    )
  }

  return null
}

export default RideList
