// src/screens/Ride/RideFinishedScreen.tsx
import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Check, Star, DollarSign, Award } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import ROUTES from '@/constants/routes'
import { CustomPlace } from '@/types/places'
import { useAppProvider } from '@/providers/AppProvider'
import { RideFareInterface } from '@/interfaces/IRideFare'
import { formatMoney } from '@/utils/formattedNumber'

type RideFinishedScreenRouteParams = {
  details: {
    rideId?: string
    pickup: CustomPlace
    dropoff: CustomPlace
    distance: string
    fare: RideFareInterface
  }
}

export default function RideFinishedScreen() {
  const { navigationMainStack, navigationHomeStack } = useAppProvider()
  const route = useRoute()
  const { details } = route.params as RideFinishedScreenRouteParams

  // Calcular "ganhos" aproximados (80% do total como exemplo)
  const driverEarnings = formatMoney(details.fare.total)
  const driverDebit = formatMoney(
    details.fare.payouts.company_earnings + details.fare.payouts.pension_fund
  )
  const formattedEarnings = `Kz ${driverEarnings}`

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-8">
          {/* Card principal */}
          <View className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
            {/* Header com gradiente */}
            <View className="p-6 items-center">
              <View className="w-24 h-24 rounded-full bg-primary-200 justify-center items-center mb-4">
                <Check size={50} color="white" />
              </View>

              <Text className="text-2xl font-bold text-gray-950 mb-2">
                Entrega Concluída!
              </Text>
              <Text className="text-gray-700 text-center">
                Você completou a entrega com sucesso
              </Text>
            </View>

            {/* Conteúdo */}
            <View className="p-6">
              {/* ID da Corrida */}
              {details.rideId && (
                <View className="bg-gray-50 rounded-lg p-3 mb-4">
                  <Text className="text-gray-500 text-xs text-center">
                    ID da Corrida: #{details.rideId.slice(-8).toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Rota */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  📍 Rota Realizada
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-xs font-bold">R</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">
                        Recolhido em
                      </Text>
                      <Text className="text-gray-800 font-medium">
                        {details.pickup.description}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-xs font-bold">E</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">Entregue em</Text>
                      <Text className="text-gray-800 font-medium">
                        {details.dropoff.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Ganhos */}
              <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <DollarSign size={20} color="#059669" />
                    <Text className="text-green-800 font-semibold ml-2">
                      Seus Ganhos
                    </Text>
                  </View>
                  <Award size={20} color="#059669" />
                </View>

                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-green-600 text-2xl font-bold">
                      {formattedEarnings}
                    </Text>
                    <Text className="text-green-700 text-sm">
                      Valor debitado na sua carteira
                    </Text>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-medium">
                      -{driverDebit} Kz
                    </Text>
                  </View>
                </View>
              </View>

              {/* Agradecimento */}
              <View className="mt-4 bg-blue-50 rounded-lg p-3">
                <Text className="text-blue-800 text-sm text-center">
                  🎉 Obrigado por usar o Kandengue! Sua avaliação ajuda a
                  melhorar nosso serviço.
                </Text>
              </View>
            </View>
          </View>

          {/* Botões de ação */}
          <View className="flex-row gap-2 mt-8 w-full max-w-md">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl py-4 flex-row items-center justify-center"
              onPress={() => {
                navigationHomeStack.reset({
                  index: 0,
                  routes: [{ name: ROUTES.HomeStack.HOME }]
                })
              }}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Voltar ao Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-primary-200 rounded-xl py-4 flex-row items-center justify-center"
              onPress={() => {
                // Navegar para tela de avaliação ou histórico
                navigationHomeStack.goBack()
              }}
            >
              <Star size={18} color="white" className="mr-2" />
              <Text className="text-white font-semibold text-base">
                Avaliar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link rápido para histórico */}
          <TouchableOpacity
            className="mt-4"
            onPress={() => navigationMainStack.navigate(ROUTES.MainTab.HISTORY)}
          >
            <Text className="text-primary-200 font-medium">
              Ver histórico de corridas →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
